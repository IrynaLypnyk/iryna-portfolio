import type { Prisma, PrismaClient } from '@/generated/prisma/client';
import { IMAGE_MIME_TYPES } from '@/lib/media/image-policy';
import { VIDEO_MIME_TYPES } from '@/lib/media/project-media-policy';
import { getImageKitFolder } from '@/lib/imagekit/getImageKitFolder';
import { projectCreateSchema, projectPatchSchema, type ProjectSectionInput } from './project-input';
import { experimentCreateSchema, experimentPatchSchema } from './experiment-input';
import { validationResult, type ContentInput, type PhotoInput } from './validation';

export class ContentSaveError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ContentSaveError';
  }
}

type Owner = {
  type: 'project' | 'experiment';
  id: string;
  slug: string;
  previousSlug?: string;
  coverAssetId: string | null;
  coverAssetUkId: string | null;
};

const mediaInclude = { asset: true, assetUk: true } as const;
const mediaOrder = [{ orderInProject: 'asc' }, { id: 'asc' }] as const;
const ownerInclude = {
  coverAsset: true,
  coverAssetUk: true,
  photos: { include: mediaInclude, orderBy: [...mediaOrder] },
  contentBlocks: {
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    include: { photos: { include: mediaInclude, orderBy: [...mediaOrder] } },
  },
} satisfies Prisma.ProjectInclude & Prisma.ExperimentInclude;

function ownerFields(owner: Owner) {
  return owner.type === 'project'
    ? { projectId: owner.id, experimentId: null }
    : { projectId: null, experimentId: owner.id };
}

function uniqueIds(ids: (string | undefined)[], field: string) {
  const present = ids.filter((id): id is string => id !== undefined);
  if (new Set(present).size !== present.length) {
    throw new ContentSaveError('An existing ID may occur only once in the save.', field);
  }
}

/** Transaction-only content writes. Omitted collections preserve stored data. */
export async function saveOwnerContent(
  tx: Prisma.TransactionClient,
  owner: Owner,
  input: ContentInput
) {
  const ownership = ownerFields(owner);
  const blocks = await tx.contentBlock.findMany({ where: ownership });
  const photos = await tx.photo.findMany({ where: ownership });
  const blocksById = new Map(blocks.map((block) => [block.id, block]));
  const photosById = new Map(photos.map((photo) => [photo.id, photo]));
  if (
    photos.some((photo) => photo.contentBlockId !== null && !blocksById.has(photo.contentBlockId))
  ) {
    throw new ContentSaveError(
      "A stored Photo is associated with a different owner's block.",
      'contentBlocks'
    );
  }
  const submittedPhotos = [
    ...(input.additionalMedia ?? []),
    ...(input.contentBlocks ?? []).flatMap((block) => block.photos ?? []),
  ];
  uniqueIds(
    (input.contentBlocks ?? []).map((block) => block.id),
    'contentBlocks'
  );
  uniqueIds(
    submittedPhotos.map((photo) => photo.id),
    'additionalMedia'
  );
  for (const block of input.contentBlocks ?? []) {
    if (block.id && !blocksById.has(block.id)) {
      throw new ContentSaveError('ContentBlock does not belong to this owner.', 'contentBlocks');
    }
  }
  for (const photo of submittedPhotos) {
    if (photo.id && !photosById.has(photo.id)) {
      throw new ContentSaveError('Photo does not belong to this owner.', 'additionalMedia');
    }
  }

  const cleanup = new Set<string>();
  const ownAssets = new Set(
    [
      owner.coverAssetId,
      owner.coverAssetUkId,
      ...photos.flatMap((photo) => [photo.assetId, photo.assetUkId]),
    ].filter((id): id is string => id !== null)
  );
  const assetCache = new Map<string, Awaited<ReturnType<typeof tx.mediaAsset.findUniqueOrThrow>>>();
  async function asset(id: string, field: string, cover = false) {
    let found = assetCache.get(id);
    if (!found) {
      const record = await tx.mediaAsset.findUnique({ where: { id } });
      if (!record) throw new ContentSaveError('MediaAsset does not exist.', field);
      const folders = [owner.slug, owner.previousSlug]
        .filter((slug): slug is string => !!slug)
        .map(
          (slug) =>
            `${getImageKitFolder(owner.type === 'project' ? 'projects' : 'experiments', slug, 'photos').replace(/\/+$/, '')}/`
        );
      // Registered uploads have no owner column. Accept this owner's existing
      // assets (including old-slug paths), or a verified upload in its folder.
      if (!ownAssets.has(id) && !folders.some((folder) => record.src.startsWith(folder))) {
        throw new ContentSaveError(
          'MediaAsset is not associated with this owner or its upload folder.',
          field
        );
      }
      if (!ownAssets.has(id)) {
        const foreignPhoto = await tx.photo.findFirst({
          where: { OR: [{ assetId: id }, { assetUkId: id }], NOT: ownership },
          select: { id: true },
        });
        const foreignProject = await tx.project.findFirst({
          where: {
            OR: [{ coverAssetId: id }, { coverAssetUkId: id }],
            ...(owner.type === 'project' ? { id: { not: owner.id } } : {}),
          },
          select: { id: true },
        });
        const foreignExperiment = await tx.experiment.findFirst({
          where: {
            OR: [{ coverAssetId: id }, { coverAssetUkId: id }],
            ...(owner.type === 'experiment' ? { id: { not: owner.id } } : {}),
          },
          select: { id: true },
        });
        if (foreignPhoto || foreignProject || foreignExperiment) {
          throw new ContentSaveError('MediaAsset is already associated with another owner.', field);
        }
      }
      if (record.width <= 0 || record.height <= 0 || !record.src.trim()) {
        throw new ContentSaveError('MediaAsset has invalid dimensions or path.', field);
      }
      found = record;
      assetCache.set(id, found);
    }
    if (
      found.mimeType !== null &&
      !IMAGE_MIME_TYPES.includes(found.mimeType) &&
      !VIDEO_MIME_TYPES.includes(found.mimeType)
    ) {
      throw new ContentSaveError('Unsupported media type.', field);
    }
    if (cover && (!found.mimeType || !IMAGE_MIME_TYPES.includes(found.mimeType))) {
      throw new ContentSaveError(
        'A cover must be a verified image, including its Ukrainian variant.',
        field
      );
    }
    return found;
  }

  if (input.coverAssetId !== undefined || input.coverAssetUkId !== undefined) {
    const defaultId = input.coverAssetId === undefined ? owner.coverAssetId : input.coverAssetId;
    const ukrainianId =
      input.coverAssetUkId === undefined ? owner.coverAssetUkId : input.coverAssetUkId;
    if (ukrainianId && !defaultId) {
      throw new ContentSaveError('A Ukrainian cover requires a default cover.', 'coverAssetUkId');
    }
    if (defaultId) await asset(defaultId, 'coverAssetId', true);
    if (ukrainianId) await asset(ukrainianId, 'coverAssetUkId', true);
    const data = { coverAssetId: defaultId, coverAssetUkId: ukrainianId };
    if (owner.type === 'project') await tx.project.update({ where: { id: owner.id }, data });
    else await tx.experiment.update({ where: { id: owner.id }, data });
    if (owner.coverAssetId && owner.coverAssetId !== defaultId) cleanup.add(owner.coverAssetId);
    if (owner.coverAssetUkId && owner.coverAssetUkId !== ukrainianId)
      cleanup.add(owner.coverAssetUkId);
  }

  const keptBlocks = new Set(
    (input.contentBlocks ?? []).flatMap((block) => (block.id ? [block.id] : []))
  );
  const removedBlocks = new Set(
    input.contentBlocks === undefined
      ? []
      : blocks.filter((block) => !keptBlocks.has(block.id)).map((block) => block.id)
  );
  const replacements = new Map<string | null, PhotoInput[]>();
  if (input.additionalMedia !== undefined) replacements.set(null, input.additionalMedia);
  for (const [index, block] of (input.contentBlocks ?? []).entries()) {
    const { id, photos: blockPhotos, ...fields } = block;
    const saved = id
      ? await tx.contentBlock.update({ where: { id }, data: { ...fields, order: index + 1 } })
      : await tx.contentBlock.create({ data: { ...fields, ...ownership, order: index + 1 } });
    if (blockPhotos !== undefined) replacements.set(saved.id, blockPhotos);
  }

  // Perform explicitly requested same-owner moves before deleting old blocks.
  // No removed usage is automatically moved into Additional Media.
  for (const [contentBlockId, items] of replacements) {
    for (const [index, item] of items.entries()) {
      const { id, assetId, assetUkId, ...metadata } = item;
      const current = id ? photosById.get(id) : undefined;
      const defaultId = assetId ?? current?.assetId;
      const ukrainianId = assetUkId === undefined ? current?.assetUkId : assetUkId;
      if (!defaultId)
        throw new ContentSaveError('A new Photo requires assetId.', 'additionalMedia');
      if (!current || assetId !== undefined)
        await asset(defaultId, 'assetId', current?.isProjectCover === true);
      if (ukrainianId && (!current || assetUkId !== undefined))
        await asset(ukrainianId, 'assetUkId', current?.isProjectCover === true);
      if (current) {
        await tx.photo.update({
          where: { id: current.id },
          data: {
            ...metadata,
            assetId,
            assetUkId,
            contentBlockId,
            orderInProject: index + 1,
          },
        });
        if (current.assetId !== defaultId) cleanup.add(current.assetId);
        if (current.assetUkId && current.assetUkId !== ukrainianId) cleanup.add(current.assetUkId);
      } else {
        await tx.photo.create({
          data: {
            ...metadata,
            ...ownership,
            assetId: defaultId,
            assetUkId,
            contentBlockId,
            orderInProject: index + 1,
          },
        });
      }
    }
  }
  const submittedIds = new Set(submittedPhotos.flatMap((photo) => (photo.id ? [photo.id] : [])));
  const removedPhotos = photos.filter(
    (photo) =>
      !submittedIds.has(photo.id) &&
      (replacements.has(photo.contentBlockId) ||
        (photo.contentBlockId !== null && removedBlocks.has(photo.contentBlockId)))
  );
  if (removedPhotos.length) {
    await tx.photo.deleteMany({
      where: { ...ownership, id: { in: removedPhotos.map((photo) => photo.id) } },
    });
    for (const photo of removedPhotos) {
      cleanup.add(photo.assetId);
      if (photo.assetUkId) cleanup.add(photo.assetUkId);
    }
  }
  if (removedBlocks.size)
    await tx.contentBlock.deleteMany({ where: { ...ownership, id: { in: [...removedBlocks] } } });

  // Stage 3 integrates the existing physical cleanup helper after commit.
  // These are candidates only: they may still have Photos or cover references.
  return [...cleanup];
}

async function saveLegacySections(
  tx: Prisma.TransactionClient,
  projectId: string,
  sections: ProjectSectionInput[] | undefined
) {
  if (sections === undefined) return;
  uniqueIds(
    sections.map((section) => section.id),
    'sections'
  );
  const current = await tx.projectSection.findMany({ where: { projectId } });
  const ids = new Set(current.map((section) => section.id));
  for (const section of sections) {
    if (section.id && !ids.has(section.id))
      throw new ContentSaveError('Section does not belong to this Project.', 'sections');
  }
  const kept = sections.flatMap((section) => (section.id ? [section.id] : []));
  await tx.projectSection.deleteMany({ where: { projectId, id: { notIn: kept } } });
  for (const [index, section] of sections.entries()) {
    const { id, ...fields } = section;
    if (id)
      await tx.projectSection.update({ where: { id }, data: { ...fields, order: index + 1 } });
    else await tx.projectSection.create({ data: { ...fields, projectId, order: index + 1 } });
  }
}

export async function saveProject(db: PrismaClient, body: unknown, id?: string) {
  const parsed = validationResult((id ? projectPatchSchema : projectCreateSchema).safeParse(body));
  if (parsed.error !== undefined) throw new ContentSaveError(parsed.error, parsed.field);
  const { contentBlocks, additionalMedia, coverAssetId, coverAssetUkId, sections, ...fields } =
    parsed.data;
  return db.$transaction(
    async (tx) => {
      const existing = id ? await tx.project.findUniqueOrThrow({ where: { id } }) : null;
      const required = id ? null : projectCreateSchema.parse(body);
      const owner = id
        ? await tx.project.update({ where: { id }, data: fields })
        : await tx.project.create({
            data: {
              ...fields,
              slug: required!.slug,
              titleEn: required!.titleEn,
              titleUk: required!.titleUk,
            },
          });
      const cleanupCandidateAssetIds = await saveOwnerContent(
        tx,
        {
          ...owner,
          type: 'project',
          previousSlug: existing?.slug,
        },
        { contentBlocks, additionalMedia, coverAssetId, coverAssetUkId }
      );
      await saveLegacySections(tx, owner.id, sections);
      const project = await tx.project.findUniqueOrThrow({
        where: { id: owner.id },
        include: {
          ...ownerInclude,
          sections: { orderBy: [{ order: 'asc' }, { id: 'asc' }] },
        },
      });
      return { project, previousSlug: existing?.slug, cleanupCandidateAssetIds };
    },
    { isolationLevel: 'Serializable' }
  );
}

export async function saveExperiment(db: PrismaClient, body: unknown, id?: string) {
  const parsed = validationResult(
    (id ? experimentPatchSchema : experimentCreateSchema).safeParse(body)
  );
  if (parsed.error !== undefined) throw new ContentSaveError(parsed.error, parsed.field);
  const { contentBlocks, additionalMedia, coverAssetId, coverAssetUkId, ...fields } = parsed.data;
  return db.$transaction(
    async (tx) => {
      const existing = id ? await tx.experiment.findUniqueOrThrow({ where: { id } }) : null;
      const required = id ? null : experimentCreateSchema.parse(body);
      const owner = id
        ? await tx.experiment.update({ where: { id }, data: fields })
        : await tx.experiment.create({
            data: {
              ...fields,
              slug: required!.slug,
              titleEn: required!.titleEn,
              titleUk: required!.titleUk,
              descriptionEn: required!.descriptionEn,
              descriptionUk: required!.descriptionUk,
            },
          });
      const cleanupCandidateAssetIds = await saveOwnerContent(
        tx,
        {
          ...owner,
          type: 'experiment',
          previousSlug: existing?.slug,
        },
        { contentBlocks, additionalMedia, coverAssetId, coverAssetUkId }
      );
      const experiment = await tx.experiment.findUniqueOrThrow({
        where: { id: owner.id },
        include: ownerInclude,
      });
      return { experiment, previousSlug: existing?.slug, cleanupCandidateAssetIds };
    },
    { isolationLevel: 'Serializable' }
  );
}
