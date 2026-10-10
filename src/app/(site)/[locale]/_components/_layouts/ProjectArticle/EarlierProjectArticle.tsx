'use client';

import { useId, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useProjectMeta, selectProjectMeta, type ProjectMetaKey } from '@/hooks/useProjectMeta';
import { MetaList } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';

import { ShowMoreButton } from '@/app/(site)/[locale]/_components/_ui/ShowMoreButton';
import { ProjectLinks } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectLinks';
import { getProjectLinks } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/utils';
import { ProjectGallery } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectGallery';

type Props = {
  project: ProjectData;
  /** 1-based position; the first cover is loaded with priority. */
  index: number;
};

export function EarlierProjectArticle({ project }: Props) {
  const t = useTranslations('Work');
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const detailsId = `${panelId}-details`;
  const galleryId = `${panelId}-gallery`;

  const allMeta = useProjectMeta(project);
  const galleryPhotos = useMemo(() => {
    const coverPhoto = project.coverPhoto;
    const photos = project.photos;
    if (!coverPhoto) return photos;

    return [
      coverPhoto,
      ...photos.filter((photo) => photo.id !== coverPhoto.id && photo.src !== coverPhoto.src),
    ];
  }, [project.coverPhoto, project.photos]);

  // Add, remove or reorder fields here; move a key between lists to change its group.
  const expandedFields: ProjectMetaKey[] = ['type', 'role', 'status', 'year', 'stack', 'features'];

  const expandedMeta = selectProjectMeta(allMeta, expandedFields);
  const expandable = expandedMeta.length > 0 || galleryPhotos.length > 0;

  const links = getProjectLinks(project, t);

  return (
    <article
      data-component="EarlierProjectArticle"
      className={cn(
        'border-app-disabled grid gap-7 overflow-visible border-b pb-4 first:border-t last:border-b md:pb-6'
      )}
    >
      <div
        className={cn(
          'group relative grid items-start gap-x-[clamp(20px,3.5vw,48px)] pt-4 md:pt-6',
          "[grid-template-areas:'textContent'_'links'_'gallery'_'btn'] md:grid-cols-[auto_minmax(0,1fr)_auto] md:[grid-template-areas:'btn_textContent_links'_'gallery_gallery_gallery']"
        )}
      >
        <div className="flex flex-col gap-2 [grid-area:textContent]">
          <h3
            className={cn(
              'mt-2 text-[clamp(1.375rem,calc(0.9583rem+1.3333vw),2.125rem)] leading-tight font-medium tracking-tight text-pretty transition-colors md:mt-0',
              expandable && 'group-hover:text-app-ink'
            )}
          >
            {project.title}
          </h3>
          <p className="text-app-muted text-base leading-normal tracking-wide whitespace-pre-line md:text-sm">
            {project.context}
          </p>
          <AnimatePresence initial={false}>
            {expandable && open && (
              <motion.div
                id={detailsId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="-pr-(--page-pad-right) grid gap-6 overflow-visible py-4"
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
          </AnimatePresence>
        </div>
        {links.length > 0 && <ProjectLinks open={open} links={links} />}
        <AnimatePresence initial={false}>
          {expandable && open && (
            <ProjectGallery
              gallery={allMeta.gallery}
              galleryId={galleryId}
              imageHeightClass="h-40"
            />
          )}
        </AnimatePresence>
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
