import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import type { LocaleType } from '@/i18n/routing';
import type { ExperimentData } from '@/types/experiments';

/** "3" → "03", matching the design's two-digit counters. */
function pad(position: number): string {
  return String(position).padStart(2, '0');
}

export async function getPublishedExperiments(locale: LocaleType): Promise<ExperimentData[]> {
  const experiments = await prisma.experiment.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
    include: { coverAsset: true },
  });

  const isUkrainian = locale === 'uk';

  return experiments.map((experiment, position) => {
    const title = isUkrainian ? experiment.titleUk : experiment.titleEn;
    const { coverAsset } = experiment;

    return {
      slug: experiment.slug,
      index: pad(position + 1),
      title,
      description: isUkrainian ? experiment.descriptionUk : experiment.descriptionEn,
      stack: experiment.stack,
      demoUrl: experiment.demoUrl,
      githubUrl: experiment.githubUrl,
      cover: coverAsset
        ? {
            id: coverAsset.id,
            src: getImageUrl(coverAsset.src),
            width: coverAsset.width,
            height: coverAsset.height,
            alt: title,
            linkUrl: null,
            description: null,
          }
        : null,
    };
  });
}
