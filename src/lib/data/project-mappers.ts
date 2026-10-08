import type { LocaleType } from '@/i18n/routing';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import type { ProjectWithRelations } from '@/lib/data/projects';
import type { Photo, ProjectData, ProjectDetail } from '@/types/projects';

type DbPhoto = ProjectWithRelations['photos'][number];

/** Picks the `…Uk` / `…En` half of a pair of DB columns. */
function pick(locale: LocaleType, uk: string, en: string): string;
function pick(locale: LocaleType, uk: string | null, en: string | null): string | null;
function pick(locale: LocaleType, uk: string | null, en: string | null): string | null {
  return locale === 'uk' ? uk : en;
}

/** "3" → "03", matching the design's two-digit counters. */
function pad(position: number): string {
  return String(position).padStart(2, '0');
}

export function toPhoto(
  project: ProjectWithRelations,
  photo: DbPhoto,
  locale: LocaleType
): Photo<string> {
  const caption = pick(locale, photo.captionUk, photo.captionEn);

  return {
    id: photo.id,
    src: getImageUrl(photo.asset.src),
    mimeType: photo.asset.mimeType,
    width: photo.asset.width,
    height: photo.asset.height,
    alt: caption ?? pick(locale, project.titleUk, project.titleEn),
    linkUrl: photo.linkUrl,
    description: pick(locale, photo.descriptionUk, photo.descriptionEn),
  };
}

export function toProjectData(project: ProjectWithRelations, locale: LocaleType): ProjectData {
  const images = project.photos.filter((photo) => !photo.asset.mimeType?.startsWith('video/'));
  const cover = images.find((photo) => photo.isProjectCover) ?? images[0];

  return {
    slug: project.slug,
    shortLabel: project.shortLabel,
    title: pick(locale, project.titleUk, project.titleEn),
    subtitle: pick(locale, project.subtitleUk, project.subtitleEn),
    context: pick(locale, project.contextUk, project.contextEn),
    role: pick(locale, project.roleUk, project.roleEn),
    stack: project.stack,
    type: project.type,
    status: project.status,
    yearLabel: project.yearLabel,
    featured: project.featured,
    order: project.order,
    coverPhoto: cover ? toPhoto(project, cover, locale) : null,
    features: locale === 'uk' ? project.featuresUk : project.featuresEn,
    externalUrl: project.externalUrl,
    linkLabel: pick(locale, project.linkLabelUk, project.linkLabelEn),
    githubUrl: project.githubUrl,
    storybookUrl: project.storybookUrl,
    photos: project.photos.map((photo) => toPhoto(project, photo, locale)),
  };
}

/**
 * Builds the case-study view model.
 *
 * `siblings` is the full published list: the case study's own number and its
 * "Next project" link are positions within the featured sequence, so they can
 * only be derived with the neighbours in hand. Next wraps around to the first
 * project, as the design does.
 */
export function toProjectDetail(
  project: ProjectWithRelations,
  siblings: ProjectWithRelations[],
  locale: LocaleType
): ProjectDetail {
  const featured = siblings.filter((candidate) => candidate.featured);
  const position = featured.findIndex((candidate) => candidate.slug === project.slug);

  const nextProject =
    position >= 0 && featured.length > 1 ? featured[(position + 1) % featured.length] : null;

  return {
    ...toProjectData(project, locale),
    index: pad(position >= 0 ? position + 1 : project.order),
    lead: pick(locale, project.leadUk, project.leadEn),
    linkNote: pick(locale, project.linkNoteUk, project.linkNoteEn),
    sections: project.sections.map((section, index) => ({
      id: section.id,
      index: pad(index + 1),
      title: pick(locale, section.titleUk, section.titleEn),
      body: pick(locale, section.bodyUk, section.bodyEn),
      body2: pick(locale, section.body2Uk, section.body2En),
    })),
    next: nextProject
      ? {
          slug: nextProject.slug,
          title: pick(locale, nextProject.titleUk, nextProject.titleEn),
        }
      : null,
  };
}
