'use client';

import { useTranslations } from 'next-intl';
import { useProjectMeta, selectProjectMeta, type ProjectMetaKey } from '@/hooks/useProjectMeta';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { MetaList } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';
import { ExpandableContent } from '@/app/(site)/[locale]/_components/_layouts/ExpandableContent';
import { getProjectLinks } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/utils';
import { ProjectLinks } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectLinks';

type Props = {
  project: ProjectData;
  /** 1-based position; the first cover is loaded with priority. */
  index: number;
};

export function RecentProjectArticle({ project, index }: Props) {
  const t = useTranslations('Work');
  const allMeta = useProjectMeta(project);

  // Add, remove or reorder fields here; move a key between lists to change its group.
  const metaFields: ProjectMetaKey[] = ['type', 'role', 'status', 'year'];
  const expandableFields: ProjectMetaKey[] = ['stack', 'features'];

  const meta = selectProjectMeta(allMeta, metaFields);
  const expandedMeta = selectProjectMeta(allMeta, expandableFields);

  const expandable =
    (project.hasDetailPage || project.preserveOverviewExpansion) &&
    (expandedMeta.length > 0 || project.photos.length > 0);

  const links = getProjectLinks(project, t);

  return (
    <ExpandableContent
      as="article"
      data-component="RecentProjectArticle"
      label={project.title}
      expandable={expandable}
      className={cn(
        'border-app-line border-t py-[clamp(28px,5vh,56px)] last:border-b last:pb-[clamp(32px,6vh,64px)] md:grid-cols-[auto_minmax(0,1fr)_minmax(160px,220px)] md:py-[clamp(28px,5vh,56px)]',
        "[grid-template-areas:'image'_'content'_'btn'] md:[grid-template-areas:'btn_content_image']"
      )}
      expandedContentClassName="-pr-(--page-pad-right) gap-1 pt-1"
      buttonClassName="md:sticky"
      visibleContent={
        <div className="flex flex-col gap-4">
          <h3
            className={cn(
              'mt-6 text-[clamp(1.375rem,calc(0.9583rem+1.3333vw),2.125rem)] leading-none font-medium tracking-tight text-pretty transition-colors md:mt-0',
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
          {meta.length > 0 && (
            <div className="flex flex-col gap-2">
              <MetaList items={meta} variant="compact" labelColor="gray" labelWidth={120} />
            </div>
          )}
        </div>
      }
      expandedContent={
        <>
          {expandedMeta.length > 0 && (
            <MetaList items={expandedMeta} variant="compact" labelColor="gray" labelWidth={120} />
          )}
          {links.length > 0 && <ProjectLinks links={links} className="mt-8" />}
        </>
      }
    >
      <ImageFrame
        photo={project.coverPhoto}
        placeholder={
          project.shortLabel ? t('coverPlaceholder', { title: project.shortLabel }) : null
        }
        priority={index === 1}
        sizes="(min-width: 768px) 20vw, 40vw"
        className="aspect-4/3 [grid-area:image]"
      />
    </ExpandableContent>
  );
}
