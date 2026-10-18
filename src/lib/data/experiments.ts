import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import type { LocaleType } from '@/i18n/routing';
import type { ExperimentData } from '@/types/experiments';
import { unstable_cache } from 'next/cache';
import {
  detailPublished,
  publicPhotos,
  publicBlocks,
  coverPhoto,
  usagePhoto,
  contentBlocks,
} from './public-media';
const include = {
  photos: publicPhotos,
  coverAsset: true,
  coverAssetUk: true,
} satisfies Prisma.ExperimentInclude;
type Experiment = Prisma.ExperimentGetPayload<{ include: typeof include }>;
export function toExperimentData(
  experiment: Experiment,
  locale: LocaleType,
  position: number
): ExperimentData {
  const uk = locale === 'uk';
  const title = uk ? experiment.titleUk : experiment.titleEn;
  return {
    slug: experiment.slug,
    index: String(position + 1).padStart(2, '0'),
    hasDetailPage: experiment.published && experiment.detailPageStatus === 'PUBLISHED',
    updatedAt: experiment.updatedAt,
    title,
    description: (uk ? experiment.descriptionUk : experiment.descriptionEn).trim(),
    shortDescription: (uk ? experiment.shortDescriptionUk : experiment.shortDescriptionEn).trim(),
    stack: experiment.stack?.trim() || null,
    demoUrl: experiment.demoUrl,
    githubUrl: experiment.githubUrl,
    cover: coverPhoto(experiment, locale, title),
    photos: experiment.photos
      .filter((photo) => !photo.isProjectCover)
      .map((photo) => usagePhoto(photo, locale, title)),
  };
}
export async function getPublishedExperiments(locale: LocaleType): Promise<ExperimentData[]> {
  const rows = await unstable_cache(
    () =>
      prisma.experiment.findMany({
        where: { published: true },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include,
      }),
    ['published-experiments', 'independent-covers-v3'],
    { revalidate: 60, tags: ['experiments'] }
  )();
  return rows.map((row, index) => toExperimentData(row, locale, index));
}
export async function getExperimentDetail(slug: string, locale: LocaleType) {
  const row = await prisma.experiment.findFirst({
    where: { slug, ...detailPublished },
    include: { ...include, contentBlocks: publicBlocks },
  });
  if (!row) return null;
  const siblings = await prisma.experiment.findMany({
    where: detailPublished,
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    select: { slug: true, titleEn: true, titleUk: true },
  });
  const index = siblings.findIndex((item) => item.slug === slug);
  const experiment = toExperimentData(row, locale, Math.max(0, index));
  const next = siblings.length > 1 ? siblings[(index + 1) % siblings.length] : null;
  return {
    experiment: {
      ...experiment,
      blocks: contentBlocks(row.contentBlocks, locale, experiment.title),
    },
    next: next ? { slug: next.slug, title: locale === 'uk' ? next.titleUk : next.titleEn } : null,
  };
}
export async function getAllExperimentSlugsForSitemap() {
  return prisma.experiment.findMany({
    where: detailPublished,
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });
}
