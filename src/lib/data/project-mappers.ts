import { legacyProjectIds, visibleAdditionalUsage } from './legacy-public-compatibility';
import type { LocaleType } from '@/i18n/routing';
import { coverPhoto, usagePhoto, contentBlocks, type PublicBlock } from './public-media';
import type { ProjectWithRelations } from '@/lib/data/projects';
import type { Photo, ProjectData, ProjectDetail } from '@/types/projects';
import { nullableText } from '@/lib/content/text';

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
  return usagePhoto(photo, locale, pick(locale, project.titleUk, project.titleEn));
}

export function toProjectData(project: ProjectWithRelations, locale: LocaleType): ProjectData {
  return {
    preserveOverviewExpansion: legacyProjectIds.has(project.id),
    hasDetailPage: project.published && project.detailPageStatus === 'PUBLISHED',
    slug: project.slug,
    shortLabel: nullableText(project.shortLabel),
    title: pick(locale, project.titleUk, project.titleEn),
    subtitle: nullableText(pick(locale, project.subtitleUk, project.subtitleEn)),
    context: nullableText(pick(locale, project.contextUk, project.contextEn)),
    role: nullableText(pick(locale, project.roleUk, project.roleEn)),
    stack: project.stack,
    projectType: nullableText(pick(locale, project.projectTypeUk, project.projectTypeEn)),
    status: project.status,
    yearLabel: nullableText(project.yearLabel),
    featured: project.featured,
    order: project.order,
    coverPhoto: coverPhoto(project, locale, pick(locale, project.titleUk, project.titleEn)),
    featuresTitle: nullableText(pick(locale, project.featuresTitleUk, project.featuresTitleEn)),
    features: locale === 'uk' ? project.featuresUk : project.featuresEn,
    externalUrl: project.externalUrl,
    linkLabel: nullableText(pick(locale, project.linkLabelUk, project.linkLabelEn)),
    githubUrl: project.githubUrl,
    storybookUrl: project.storybookUrl,
    photos: project.photos
      .filter(visibleAdditionalUsage)
      .map((photo) => toPhoto(project, photo, locale)),
  };
}

/** Numbering and next links follow only the published detail-page sequence. */
export function toProjectDetail(
  project: ProjectWithRelations & { contentBlocks?: PublicBlock[] },
  siblings: Pick<
    ProjectWithRelations,
    'slug' | 'titleEn' | 'titleUk' | 'published' | 'detailPageStatus'
  >[],
  locale: LocaleType
): ProjectDetail {
  const published = siblings.filter(
    (candidate) => candidate.published && candidate.detailPageStatus === 'PUBLISHED'
  );
  const position = published.findIndex((candidate) => candidate.slug === project.slug);

  const nextProject =
    position >= 0 && published.length > 1 ? published[(position + 1) % published.length] : null;

  return {
    ...toProjectData(project, locale),
    index: pad(position >= 0 ? position + 1 : project.order),
    lead: nullableText(pick(locale, project.leadUk, project.leadEn)),
    linkNote: nullableText(pick(locale, project.linkNoteUk, project.linkNoteEn)),
    sections: contentBlocks(
      project.contentBlocks,
      locale,
      pick(locale, project.titleUk, project.titleEn)
    ),
    next: nextProject
      ? {
          slug: nextProject.slug,
          title: pick(locale, nextProject.titleUk, nextProject.titleEn),
        }
      : null,
  };
}
