'use client';

import { ProjectStack } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectStack';
import { useTranslations } from 'next-intl';
import type { MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { ProjectFeatures } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectFeatures';
import type { ProjectData } from '@/types/projects';

// Default summary order; each article chooses its own groups.
export const PROJECT_META_ORDER = ['type', 'role', 'stack', 'status', 'year'] as const;

// Gallery photos are data, so they are rendered separately from MetaList rows.
export type ProjectMetaKey = (typeof PROJECT_META_ORDER)[number] | 'features';
export type ProjectGalleryMeta = {
  gallery: { label: string; value: ProjectData['photos'] } | null;
};
export type ProjectMeta = Record<ProjectMetaKey, MetaItem | null> & ProjectGalleryMeta;

/** Select, order and deduplicate available fields without rendering empty rows. */
export function selectProjectMeta(items: ProjectMeta, keys: readonly ProjectMetaKey[]): MetaItem[] {
  return [...new Set(keys)].map((key) => items[key]).filter((item) => item !== null);
}

export function useProjectMeta(project: ProjectData): ProjectMeta {
  const t = useTranslations('Work');
  const tMetadata = useTranslations('ProjectMetadata');

  return {
    // Older cached payloads may predate the enum fields.
    type:
      project.type && tMetadata.has(`types.${project.type}`)
        ? { label: tMetadata('labelType'), value: tMetadata(`types.${project.type}`) }
        : null,
    role: project.role ? { label: t('labelRole'), value: project.role } : null,
    stack: project.stack.length
      ? { label: t('labelStack'), value: <ProjectStack items={project.stack} /> }
      : null,
    status:
      project.status && tMetadata.has(`statuses.${project.status}`)
        ? { label: tMetadata('labelStatus'), value: tMetadata(`statuses.${project.status}`) }
        : null,
    year: project.yearLabel ? { label: t('labelYear'), value: project.yearLabel } : null,
    features: project.features.length
      ? { label: t('labelFeatures'), value: <ProjectFeatures features={project.features} /> }
      : null,
    gallery: project.photos.length ? { label: t('labelGallery'), value: project.photos } : null,
  };
}
