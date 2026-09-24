import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import type { LocaleType } from '@/i18n/routing';
import type { ProjectData } from '@/types/projects';

export async function getPublishedProjects(locale: LocaleType): Promise<ProjectData[]> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { id: 'asc' }],
    include: {
      photos: {
        orderBy: [{ isProjectCover: 'desc' }, { orderInProject: 'asc' }, { id: 'asc' }],
        take: 1,
        include: { asset: true, assetUk: true },
      },
    },
  });

  const isUkrainian = locale === 'uk';

  return projects.map((project) => {
    const title = isUkrainian ? project.titleUk : project.titleEn;
    const cover = project.photos[0];
    const asset = cover && (isUkrainian ? (cover.assetUk ?? cover.asset) : cover.asset);

    return {
      slug: project.slug,
      shortLabel: project.shortLabel,
      title,
      subtitle: isUkrainian ? project.subtitleUk : project.subtitleEn,
      context: isUkrainian ? project.contextUk : project.contextEn,
      role: isUkrainian ? project.roleUk : project.roleEn,
      stack: project.stack,
      status: isUkrainian ? project.statusUk : project.statusEn,
      yearLabel: project.yearLabel,
      featured: project.featured,
      order: project.order,
      coverPhoto:
        cover && asset
          ? {
              id: cover.id,
              src: getImageUrl(asset.src),
              width: asset.width,
              height: asset.height,
              alt: (isUkrainian ? cover.captionUk : cover.captionEn) || title,
            }
          : null,
    };
  });
}
