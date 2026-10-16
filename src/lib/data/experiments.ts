import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import type { LocaleType } from '@/i18n/routing';
import type { ExperimentData } from '@/types/experiments';
import { unstable_cache } from 'next/cache';

/** "3" → "03", matching the design's two-digit counters. */
function pad(position: number): string {
  return String(position).padStart(2, '0');
}

export async function getPublishedExperiments(locale: LocaleType): Promise<ExperimentData[]> {
  // Share the raw data across locales and invalidate it using the admin's
  // existing experiments tag, including photo changes.
  const experiments = await unstable_cache(
    () =>
      prisma.experiment.findMany({
        where: { published: true },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include: {
          photos: {
            where: { contentBlockId: null },
            orderBy: [{ orderInProject: 'asc' }, { id: 'asc' }],
            include: { asset: true, assetUk: true },
          },
        },
      }),
    ['published-experiments', 'localized-media-v1', 'additional-media-v2'],
    { revalidate: 60, tags: ['experiments'] }
  )();

  const isUkrainian = locale === 'uk';

  return experiments.map((experiment, position) => {
    const title = isUkrainian ? experiment.titleUk : experiment.titleEn;
    const photos = experiment.photos.map((photo) => {
      const asset = isUkrainian ? (photo.assetUk ?? photo.asset) : photo.asset;
      return {
        id: photo.id,
        src: getImageUrl(asset.src),
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
        alt: (isUkrainian ? photo.captionUk : photo.captionEn) || title,
        linkUrl: photo.linkUrl,
        description: isUkrainian ? photo.descriptionUk : photo.descriptionEn,
      };
    });
    const coverPhoto = experiment.photos.find((photo) => photo.isProjectCover);
    const cover =
      photos.find((photo) => photo.id === coverPhoto?.id) ??
      photos.find((photo) => !photo.mimeType?.startsWith('video/')) ??
      null;

    return {
      slug: experiment.slug,
      index: pad(position + 1),
      title,
      description: isUkrainian ? experiment.descriptionUk : experiment.descriptionEn,
      shortDescription: isUkrainian ? experiment.shortDescriptionUk : experiment.shortDescriptionEn,
      stack: experiment.stack,
      demoUrl: experiment.demoUrl,
      githubUrl: experiment.githubUrl,
      cover,
      photos: photos.filter((photo) => photo.id !== cover?.id),
    };
  });
}
