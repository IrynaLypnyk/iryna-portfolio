const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const videoTypes = new Set(['video/mp4', 'video/webm']);
const ordered = (rows, field) =>
  [...rows].sort((a, b) => (a[field] ?? 0) - (b[field] ?? 0) || a.id.localeCompare(b.id));
const ids = (rows) => rows.map((row) => row.id);
const difference = (a, b) => a.filter((id) => !b.includes(id));
const populated = (value) => typeof value === 'string' && value.trim().length > 0;

export function assetIssues(asset, cover = false) {
  if (!asset) return ['missing_asset'];
  const issues = [];
  if (!asset.mimeType) issues.push('missing_mime');
  else if (!imageTypes.has(asset.mimeType) && (cover || !videoTypes.has(asset.mimeType)))
    issues.push(cover ? 'unsupported_cover_mime' : 'unsupported_mime');
  if (!(asset.width > 0 && asset.height > 0)) issues.push('invalid_dimensions');
  if (!populated(asset.src)) issues.push('missing_path');
  if (!populated(asset.imageKitFileId)) issues.push('missing_imagekit_file_id');
  return issues;
}

/** Pure analysis: no network, inferred metadata, mutations or publication decisions. */
export function buildLegacyContentReport({
  projects,
  experiments,
  photos,
  assets,
  sections,
  blocks = [],
  hasV2 = false,
}) {
  const byAsset = new Map(assets.map((asset) => [asset.id, asset]));
  const reference = (id) =>
    id == null ? null : { assetId: id, issues: assetIssues(byAsset.get(id), true) };
  const owners = [
    ...projects.map((p) => ['project', p]),
    ...experiments.map((e) => ['experiment', e]),
  ].map(([type, owner]) => {
    const ownerKey = type === 'project' ? 'projectId' : 'experimentId';
    const usages = ordered(
      photos.filter((p) => p[ownerKey] === owner.id),
      'orderInProject'
    );
    const explicit = usages.filter((p) => p.isProjectCover);
    // Exact legacy mapper choice; unknown MIME was historically treated as an image.
    // This is evidence of old rendering, NOT proof that the asset is an image.
    const images = usages.filter((p) => !byAsset.get(p.assetId)?.mimeType?.startsWith('video/'));
    const legacyCover =
      type === 'project'
        ? (images.find((p) => p.isProjectCover) ?? images[0])
        : (explicit[0] ?? images[0]);
    const validExplicit =
      explicit.length === 1 &&
      assetIssues(byAsset.get(explicit[0].assetId), true).length === 0 &&
      (!explicit[0].assetUkId ||
        assetIssues(byAsset.get(explicit[0].assetUkId), true).length === 0);
    const projectedCover = hasV2
      ? (owner.coverAssetId ?? null)
      : validExplicit
        ? explicit[0].assetId
        : null;
    const legacyGallery =
      type === 'experiment' ? usages.filter((p) => p.id !== legacyCover?.id) : usages;
    const additional = usages.filter((p) => !p.contentBlockId && !p.isProjectCover);
    const ownerSections = ordered(
      sections.filter((s) => s.projectId === owner.id && type === 'project'),
      'order'
    );
    const ownerBlocks = ordered(
      blocks.filter((b) => b[ownerKey] === owner.id),
      'order'
    );
    const blockers = [];
    if (explicit.length > 1) blockers.push('multiple_explicit_covers');
    if (
      explicit.some(
        (p) =>
          assetIssues(byAsset.get(p.assetId), true).length ||
          (p.assetUkId && assetIssues(byAsset.get(p.assetUkId), true).length)
      )
    )
      blockers.push('invalid_explicit_cover_metadata');
    const projectedUk = hasV2
      ? (owner.coverAssetUkId ?? null)
      : validExplicit
        ? (explicit[0].assetUkId ?? null)
        : null;
    const coverDiffers =
      (legacyCover?.assetId ?? null) !== projectedCover ||
      (legacyCover?.assetUkId ?? null) !== projectedUk;
    const currentCoverIssues =
      hasV2 &&
      [owner.coverAssetId, owner.coverAssetUkId].some(
        (id) => id && assetIssues(byAsset.get(id), true).length
      );
    const legacyIds = ids(legacyGallery),
      additionalIds = ids(additional);
    return {
      type,
      id: owner.id,
      slug: owner.slug,
      published: owner.published,
      detailPages: {
        urls: ['en', 'uk'].map(
          (locale) =>
            `/${locale}/${type === 'project' ? 'projects' : 'playground'}/${encodeURIComponent(owner.slug)}`
        ),
        legacyEligible: !!owner.published,
        currentStatus: hasV2 ? owner.detailPageStatus : null,
        v2Eligible: hasV2 ? owner.published && owner.detailPageStatus === 'PUBLISHED' : null,
        migrationWouldSetStatus: owner.published ? 'PUBLISHED' : 'DRAFT',
        liveUrlVerified: false,
      },
      features: {
        en: owner.featuresEn ?? [],
        uk: owner.featuresUk ?? [],
        titleEn: owner.featuresTitleEn ?? null,
        titleUk: owner.featuresTitleUk ?? null,
      },
      sections: ownerSections,
      contentBlockIds: ids(ownerBlocks),
      sectionCopiesMissing: hasV2
        ? ownerSections.filter((s) => !ownerBlocks.some((b) => b.id === s.id)).map((s) => s.id)
        : [],
      covers: {
        explicitCandidates: explicit.map((p) => ({
          photoId: p.id,
          default: reference(p.assetId),
          uk: reference(p.assetUkId),
        })),
        legacySelectedPhotoId: legacyCover?.id ?? null,
        legacySelection: !legacyCover
          ? 'none'
          : legacyCover.isProjectCover
            ? 'explicit'
            : 'implicit',
        legacyDefault: reference(legacyCover?.assetId),
        legacyUk: reference(legacyCover?.assetUkId),
        proposedByExistingMigration: hasV2
          ? null
          : {
              default: reference(projectedCover),
              uk: reference(validExplicit ? explicit[0].assetUkId : null),
            },
        current: hasV2
          ? { default: reference(owner.coverAssetId), uk: reference(owner.coverAssetUkId) }
          : null,
        defaultWouldDiffer: (legacyCover?.assetId ?? null) !== projectedCover,
        ukWouldDiffer: (legacyCover?.assetUkId ?? null) !== projectedUk,
        ukWithoutDefault: hasV2 && !!owner.coverAssetUkId && !owner.coverAssetId,
      },
      gallery: {
        legacyMappedPhotoIds: legacyIds,
        // Legacy Project detail rendered only the first three mapped Photos.
        legacyDetailPhotoIds: type === 'project' ? ids(usages.slice(0, 3)) : legacyIds,
        v2AdditionalPhotoIds: additionalIds,
        v2BlockPhotoIds: ids(usages.filter((p) => p.contentBlockId)),
        removedFromAdditional: difference(legacyIds, additionalIds),
        addedToAdditional: difference(additionalIds, legacyIds),
        legacyCoverOnlyPhotoIds: ids(explicit.filter((p) => !p.contentBlockId)),
      },
      migrationBlockers: blockers,
      reviewRequired: !!(
        blockers.length ||
        coverDiffers ||
        currentCoverIssues ||
        (hasV2 && ownerSections.some((s) => !ownerBlocks.some((b) => b.id === s.id))) ||
        (legacyCover && !legacyCover.isProjectCover) ||
        difference(legacyIds, additionalIds).length ||
        difference(additionalIds, legacyIds).length ||
        (type === 'project' && (owner.featuresEn?.length || owner.featuresUk?.length))
      ),
    };
  });
  return {
    schemaVersion: 1,
    hasV2,
    limitations: [
      'Database-derived legacy eligibility is not verification of live URLs or deployment history.',
      'No ImageKit metadata or file existence verification was performed.',
      'No proposed cover is auto-approved; metadata must be verified before reconciliation.',
      'After cutover, current rows cannot reconstruct prior deletions or edits; use a pre-cutover backup for historical evidence.',
    ],
    counts: {
      projects: projects.length,
      experiments: experiments.length,
      photos: photos.length,
      mediaAssets: assets.length,
      projectSections: sections.length,
      contentBlocks: blocks.length,
    },
    assetsNeedingReview: assets
      .map((a) => ({ assetId: a.id, imageKitFileId: a.imageKitFileId, issues: assetIssues(a) }))
      .filter((a) => a.issues.length),
    missingPhotoAssets: photos.flatMap((p) =>
      [p.assetId, p.assetUkId]
        .filter((id) => id && !byAsset.has(id))
        .map((assetId) => ({ photoId: p.id, assetId }))
    ),
    owners,
  };
}

/** Transaction is read-only at PostgreSQL level, including on query failure. */
export async function readLegacyContentReport(client) {
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    await client.query("SET LOCAL statement_timeout = '30s'");
    const identity = (
      await client.query(
        'SELECT current_database() AS database, host(inet_server_addr()) AS address'
      )
    ).rows[0];
    if (!['127.0.0.1', '::1'].includes(identity.address))
      throw new Error('Refusing non-local database');
    const available = (
      await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      )
    ).rows.map((r) => r.table_name);
    const rows = {};
    for (const [key, table] of Object.entries({
      projects: 'Project',
      experiments: 'Experiment',
      photos: 'Photo',
      assets: 'MediaAsset',
      sections: 'ProjectSection',
      blocks: 'ContentBlock',
    })) {
      if (!available.includes(table)) {
        if (table !== 'ContentBlock') throw new Error(`Required table missing: ${table}`);
        rows[key] = [];
      } else
        rows[key] = (
          await client.query(`SELECT to_jsonb(t) AS data FROM public."${table}" t ORDER BY id`)
        ).rows.map((r) => r.data);
    }
    return {
      target: identity,
      ...buildLegacyContentReport({ ...rows, hasV2: available.includes('ContentBlock') }),
    };
  } finally {
    await client.query('ROLLBACK');
  }
}
