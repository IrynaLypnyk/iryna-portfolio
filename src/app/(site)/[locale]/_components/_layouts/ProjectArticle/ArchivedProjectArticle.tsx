'use client';

import { useTranslations } from 'next-intl';
import { useProjectMeta, selectProjectMeta, type ProjectMetaKey } from '@/hooks/useProjectMeta';
import { MetaList } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';

import { ExpandableContent } from '@/app/(site)/[locale]/_components/_layouts/ExpandableContent';
import { ProjectLinks } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectLinks';
import { getProjectLinks } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/utils';
import { ProjectGallery } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectGallery';

type Props = {
  project: ProjectData;
  /** 1-based position; the first cover is loaded with priority. */
  index: number;
};

export function ArchivedProjectArticle({ project }: Props) {
  const t = useTranslations('Work');
  const allMeta = useProjectMeta(project);
  // Add, remove or reorder fields here; move a key between lists to change its group.
  const expandedFields: ProjectMetaKey[] = ['type', 'role', 'status', 'year', 'stack', 'features'];

  const expandedMeta = selectProjectMeta(allMeta, expandedFields);
  const expandable =
    (!project.hasDetailPage || project.preserveOverviewExpansion) &&
    (expandedMeta.length > 0 || project.photos.length > 0);

  const links = getProjectLinks(project, t);

  return (
    <ExpandableContent
      as="article"
      data-component="EarlierProjectArticle"
      label={project.title}
      expandable={expandable}
      className="border-app-line border-t py-4 [grid-template-areas:'content'_'links'_'fullWidthExpanded'_'btn'] last:border-b md:grid-cols-[auto_minmax(0,1fr)_auto] md:py-6 md:[grid-template-areas:'btn_content_links'_'fullWidthExpanded_fullWidthExpanded_fullWidthExpanded']"
      expandedContentClassName="-pr-(--page-pad-right) grid gap-1 pt-6 pb-4"
      buttonClassName="mt-8 md:mt-0"
      visibleContent={
        <div className="flex flex-col gap-2">
          <h3
            className={cn(
              'mt-2 text-[clamp(1.375rem,calc(0.9583rem+1.3333vw),2.125rem)] leading-tight font-medium tracking-tight text-pretty transition-colors md:mt-0',
              expandable && 'group-hover:text-app-ink'
            )}
          >
            {project.title}
          </h3>
          {project.context && (
            <p className="text-app-muted text-base leading-normal tracking-wide whitespace-pre-line">
              {project.context}
            </p>
          )}
        </div>
      }
      expandedContent={
        expandedMeta.length > 0 && (
          <MetaList items={expandedMeta} variant="compact" labelColor="gray" labelWidth={120} />
        )
      }
      fullWidthExpandedContent={
        <ProjectGallery gallery={allMeta.gallery} imageHeightClass="h-40" />
      }
    >
      {links.length > 0 && <ProjectLinks links={links} className="mt-2" />}
    </ExpandableContent>
  );
}
