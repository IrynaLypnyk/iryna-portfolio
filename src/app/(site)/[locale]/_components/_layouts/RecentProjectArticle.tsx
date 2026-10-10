'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useProjectMeta, selectProjectMeta, type ProjectMetaKey } from '@/hooks/useProjectMeta';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { MetaList } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';
import { ProjectGallery } from '@/app/(site)/[locale]/_components/_ui/ProjectGallery';
import { ShowMoreButton } from '@/app/(site)/[locale]/_components/_ui/ShowMoreButton';

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

  const allMeta = useProjectMeta(project);

  // Add, remove or reorder fields here; move a key between lists to change its group.
  const metaFields: ProjectMetaKey[] = ['type', 'role', 'status', 'year'];
  const expandedFields: ProjectMetaKey[] = ['stack', 'features'];

  const meta = selectProjectMeta(allMeta, metaFields);
  const expandedMeta = selectProjectMeta(
    allMeta,
    expandedFields.filter((key) => !metaFields.includes(key))
  );
  const expandable = expandedMeta.length > 0;

  const links = [
    project.externalUrl && {
      href: project.externalUrl,
      label: project.linkLabel ?? t('demoLabel'),
    },
    project.githubUrl && { href: project.githubUrl, label: t('githubLabel') },
    project.storybookUrl && { href: project.storybookUrl, label: t('storybookLabel') },
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  return (
    <article
      data-component="RecentProjectArticle"
      className={cn(
        'border-app-disabled grid gap-7 overflow-visible border-b pb-[clamp(28px,5vh,56px)] first:border-t last:border-b last:pb-[clamp(32px,6vh,64px)]'
      )}
    >
      <div
        className={cn(
          'group relative grid items-start gap-[clamp(20px,3.5vw,48px)] pt-[clamp(28px,5vh,56px)]',
          expandable
            ? "[grid-template-areas:'image'_'textContent'_'btn'] md:grid-cols-[auto_minmax(0,1fr)_minmax(160px,220px)] md:[grid-template-areas:'btn_textContent_image']"
            : 'md:grid-cols-[minmax(0,1fr)_minmax(160px,220px)]'
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
              'mt-6 text-[clamp(1.375rem,calc(0.9583rem+1.3333vw),2.125rem)] leading-tight font-medium tracking-tight text-pretty transition-colors md:mt-0',
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
              <>
                {expandable && open && (
                  <motion.div
                    id={detailsId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="-pr-(--page-pad-right) grid gap-6 overflow-visible pb-4"
                  >
                    {expandedMeta.length > 0 && (
                      <MetaList
                        items={expandedMeta}
                        variant="compact"
                        labelColor="gray"
                        labelWidth={120}
                      />
                    )}
                  </motion.div>
                )}
                {expandable && open && (
                  <motion.div
                    id={galleryId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="border-app-line -pr-(--page-pad-right) overflow-visible border-t pt-7"
                  >
                    <div className="grid gap-6 pb-4">
                      <div key="gallery" className="grid gap-3">
                        {allMeta.gallery && <ProjectGallery photos={allMeta.gallery.value} />}
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            </AnimatePresence>
          </div>
          {links.length > 0 && (
            <div className="relative inline-flex flex-wrap gap-x-8 gap-y-1.5">
              {links.map((link) => (
                <AppLink
                  key={link.label}
                  href={link.href}
                  external
                  arrow="upRight"
                  color="blueBright"
                >
                  {link.label}
                </AppLink>
              ))}
            </div>
          )}
        </div>
        {expandable && (
          <ShowMoreButton
            open={open}
            setOpenAction={() => setOpen((current) => !current)}
            detailsId={detailsId}
            galleryId={galleryId}
            projectTitle={project.title}
            className="[grid-area:btn]"
          />
        )}
      </div>
    </article>
  );
}
