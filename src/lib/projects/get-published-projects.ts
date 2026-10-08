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
        include: { asset: true, assetUk: true },
      },
    },
  });

  const isUkrainian = locale === 'uk';

  return projects.map((project) => {
    const title = isUkrainian ? project.titleUk : project.titleEn;
    const cover = project.photos.find((photo) => photo.isProjectCover);
    const asset = cover && (isUkrainian ? (cover.assetUk ?? cover.asset) : cover.asset);

    const photos = project.photos
      .filter((photo) => !photo.isProjectCover)
      .flatMap((photo) => {
        const photoAsset = isUkrainian ? (photo.assetUk ?? photo.asset) : photo.asset;

        if (!photoAsset) {
          return [];
        }

        return [
          {
            id: photo.id,
            src: getImageUrl(photoAsset.src),
            mimeType: photoAsset.mimeType,
            width: photoAsset.width,
            height: photoAsset.height,
            alt: (isUkrainian ? photo.captionUk : photo.captionEn) || title,
            linkUrl: photo.linkUrl,
            description: isUkrainian ? photo.descriptionUk : photo.descriptionEn,
          },
        ];
      });

    return {
      slug: project.slug,
      shortLabel: project.shortLabel,
      title,
      subtitle: isUkrainian ? project.subtitleUk : project.subtitleEn,
      context: isUkrainian ? project.contextUk : project.contextEn,
      role: isUkrainian ? project.roleUk : project.roleEn,
      stack: project.stack,
      type: project.type,
      status: project.status,
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
              linkUrl: cover.linkUrl,
              description: isUkrainian ? cover.descriptionUk : cover.descriptionEn,
            }
          : null,
      features: isUkrainian ? project.featuresUk : project.featuresEn,
      externalUrl: project.externalUrl,
      linkLabel: isUkrainian ? project.linkLabelUk : project.linkLabelEn,
      githubUrl: project.githubUrl,
      storybookUrl: project.storybookUrl,
      photos,
    };
  });
}
