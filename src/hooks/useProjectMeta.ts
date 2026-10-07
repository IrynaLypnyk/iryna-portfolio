'use client';

import { useTranslations } from 'next-intl';
import type { MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import type { ProjectData } from '@/types/projects';

// Reorder this array to change the metadata order in both project articles.
const PROJECT_META_ORDER = ['type', 'role', 'stack', 'status', 'year'] as const;

export function useProjectMeta(project: ProjectData): MetaItem[] {
  const t = useTranslations('Work');
  const tMetadata = useTranslations('ProjectMetadata');

  const items: Record<(typeof PROJECT_META_ORDER)[number], MetaItem | null> = {
    // Older cached payloads may predate the enum fields.
    type:
      project.type && tMetadata.has(`types.${project.type}`)
        ? { label: tMetadata('labelType'), value: tMetadata(`types.${project.type}`) }
        : null,
    role: { label: t('labelRole'), value: project.role },
    stack: project.stack ? { label: t('labelStack'), value: project.stack } : null,
    status:
      project.status && tMetadata.has(`statuses.${project.status}`)
        ? { label: tMetadata('labelStatus'), value: tMetadata(`statuses.${project.status}`) }
        : null,
    year: project.yearLabel ? { label: t('labelYear'), value: project.yearLabel } : null,
  };

  return PROJECT_META_ORDER.map((key) => items[key]).filter((item) => item !== null);
}
