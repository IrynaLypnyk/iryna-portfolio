'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useProjectMeta, selectProjectMeta, type ProjectMetaKey } from '@/hooks/useProjectMeta';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { MetaList } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';
import { ShowMoreButton } from '@/app/(site)/[locale]/_components/_ui/ShowMoreButton';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { getProjectLinks } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/utils';
import { ProjectLinks } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectLinks';
import { ProjectGallery } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectGallery';

type Props = {
  project: ProjectData;
  /** 1-based position; the first cover is loaded with priority. */
  index: number;
};

export function RecentProjectArticle({ project, index }: Props) {
  const t = useTranslations('Work');
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const detailsId = `${panelId}-details`;
  const galleryId = `${panelId}-gallery`;
  const { isMobile } = useBreakpoint();

  const allMeta = useProjectMeta(project);

  // Add, remove or reorder fields here; move a key between lists to change its group.
  const metaFields: ProjectMetaKey[] = ['type', 'role', 'status', 'year'];

  const meta = selectProjectMeta(allMeta, metaFields);
  const featuresMeta = selectProjectMeta(allMeta, ['features']);
  const stackMeta = selectProjectMeta(allMeta, ['stack']);
  const expandable = featuresMeta.length > 0 || stackMeta.length > 0;

  const links = getProjectLinks(project, t);

  return (
    <article
      data-component="RecentProjectArticle"
      className={cn(
        'border-app-disabled grid gap-7 overflow-visible border-b pb-[clamp(28px,5vh,56px)] first:border-t last:border-b last:pb-[clamp(32px,6vh,64px)]'
      )}
    >
      <div
        className={cn(
          'group relative grid items-start gap-x-[clamp(20px,3.5vw,48px)] pt-[clamp(28px,5vh,56px)] md:grid-cols-[auto_minmax(0,1fr)_minmax(160px,220px)]',
          // Keep areas defined while AnimatePresence runs exit animations to avoid implicit columns.
          "[grid-template-areas:'image'_'textContent'_'features'_'links'_'gallery'_'btn'] md:[grid-template-areas:'btn_textContent_image'_'._features_.'_'._links_.'_'gallery_gallery_gallery']"
        )}
      >
        <ImageFrame
          photo={project.coverPhoto}
          placeholder={t('coverPlaceholder', { title: project.shortLabel })}
          priority={index === 1}
          sizes="(min-width: 768px) 20vw, 40vw"
          className="aspect-4/3 [grid-area:image]"
        />

        <div className="flex flex-col gap-4 [grid-area:textContent]">
          <h3
            className={cn(
              'mt-6 text-[clamp(1.375rem,calc(0.9583rem+1.3333vw),2.125rem)] leading-none font-medium tracking-tight text-pretty transition-colors md:mt-0',
              expandable && 'group-hover:text-app-ink'
            )}
          >
            {project.title}
          </h3>

          <p className="text-app-muted text-base leading-normal tracking-wide whitespace-pre-line">
            {project.context}
          </p>

          <div className="flex flex-col gap-2">
            {meta.length > 0 && (
              <MetaList items={meta} variant="compact" labelColor="gray" labelWidth={120} />
            )}
            <AnimatePresence initial={false}>
              {expandable && open && (
                <motion.div
                  id={detailsId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="-pr-(--page-pad-right) grid gap-6 overflow-visible"
                >
                  {stackMeta.length > 0 && (
                    <MetaList
                      items={stackMeta}
                      variant="compact"
                      labelColor="gray"
                      labelWidth={120}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expandable && open && (
            <motion.div
              id={detailsId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="-pr-(--page-pad-right) grid gap-6 overflow-visible [grid-area:features]"
            >
              {featuresMeta.length > 0 && (
                <MetaList
                  items={featuresMeta}
                  variant={isMobile ? 'panel' : 'compact'}
                  labelColor="gray"
                  labelWidth={120}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {expandable && open && (
            <ProjectGallery
              gallery={allMeta.gallery}
              galleryId={galleryId}
              imageHeightClass="h-40"
            />
          )}
        </AnimatePresence>

        {links.length > 0 && <ProjectLinks open={open} links={links} />}
        {expandable && (
          <ShowMoreButton
            open={open}
            setOpenAction={() => setOpen((current) => !current)}
            detailsId={detailsId}
            galleryId={galleryId}
            projectTitle={project.title}
            className="sticky [grid-area:btn]"
          />
        )}
      </div>
    </article>
  );
}
