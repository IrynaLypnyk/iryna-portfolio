'use client';

import { useState, useId } from 'react';
import { useTranslations } from 'next-intl';
import type { ProjectData } from '@/types/projects';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { ArchivedProjectArticle } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ArchivedProjectArticle';
import { ShowMoreButton } from '@/app/(site)/[locale]/_components/_ui/ShowMoreButton';
import { Collapse } from '@/app/(site)/[locale]/_components/_ui/Collapse';

type Props = {
  projects: ProjectData[];
};

export function ArchivedProjects({ projects }: Props) {
  const t = useTranslations('Work');
  const detailsId = useId();
  const [open, setOpen] = useState(true);
  if (projects.length === 0) return null;

  return (
    <div data-component="ArchivedProjects">
      <SectionHeader
        title={t('moreWork.title')}
        titleTag="h3"
        subtitle={t('moreWork.description')}
        subtitleTag="h4"
        className="mt-7 mb-2 md:mt-10 md:mb-2 lg:mt-20 lg:mb-2"
      />
      <ShowMoreButton
        open={open}
        setOpenAction={() => setOpen((current) => !current)}
        detailsId={detailsId}
        projectTitle={t('moreWork.title')}
        btnLabel={open ? t('moreWork.hideArchivedProjects') : t('moreWork.viewArchivedProjects')}
        className="pt-3 pb-4 md:pt-6 md:pb-8"
      />
      <div id={detailsId}>
        <Collapse open={open} duration={250}>
          {projects.map((project, position) => (
            <ArchivedProjectArticle key={project.slug} project={project} index={position + 1} />
          ))}
        </Collapse>
      </div>
    </div>
  );
}
