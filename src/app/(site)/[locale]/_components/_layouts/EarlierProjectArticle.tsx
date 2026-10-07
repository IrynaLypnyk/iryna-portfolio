'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { ProjectGallery } from '@/app/(site)/[locale]/_components/_ui/ProjectGallery';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import { ActionBox } from '@/app/(site)/[locale]/_components/_ui/ActionBox';

type Props = {
  project: ProjectData;
  /** 1-based position, rendered as the "01" kicker. */
  index: number;
};

export function EarlierProjectArticle({ project }: Props) {
  const t = useTranslations('Work');
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const expandedMeta: MetaItem[] = [{ label: t('labelRole'), value: project.role }];

  if (project.stack) {
    expandedMeta.push({ label: t('labelStack'), value: project.stack });
  }

  if (project.yearLabel) {
    expandedMeta.push({ label: t('labelYear'), value: project.yearLabel });
  }

  const links = [
    project.externalUrl && {
      href: project.externalUrl,
      label: project.linkLabel ?? t('demoLabel'),
    },
    project.githubUrl && { href: project.githubUrl, label: t('githubLabel') },
    project.storybookUrl && { href: project.storybookUrl, label: t('storybookLabel') },
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  const expandable = project.features.length > 0 || project.photos.length > 1;

  const showMoreButton = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={`${open ? t('hideDetails') : t('showDetails')}: ${project.title}`}
      onClick={() => setOpen((current) => !current)}
      className="text-app-accent-bright cursor-pointer"
    >
      <ActionBox colorMode="onLight">
        {open ? <Minus size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
      </ActionBox>
    </button>
  );

  return (
    <article
      data-component="EarlierProjectArticle"
      className={cn('border-app-line overflow-visible border-b first:border-t last:border-b-0')}
    >
      <div className="grid items-baseline gap-1 py-5 md:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto] md:gap-6">
        {expandable && <div className="hidden md:inline-block">{showMoreButton}</div>}
        <h5 className="text-app-ink text-[17px] transition-colors">{project.title}</h5>
        <span className="text-app-muted text-[15px] text-pretty">{project.context}</span>
        <p className="text-app-muted text-[15px] text-pretty">{project.yearLabel}</p>
        {links.length > 0 && (
          <div className="relative z-10 inline-flex flex-wrap gap-x-4 gap-y-1.5">
            {links.map((link) => (
              <AppLink
                key={link.label}
                href={link.href}
                external
                arrow="upRight"
                color="black"
                variant="underline"
              >
                {link.label}
              </AppLink>
            ))}
          </div>
        )}
        {expandable && <div className="pt-2 md:hidden">{showMoreButton}</div>}
      </div>

      <AnimatePresence initial={false}>
        {expandable && open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-app-line -pr-(--page-pad-right) overflow-visible border-t pt-7"
          >
            <div className="grid">
              {expandedMeta.length > 0 && (
                <MetaList
                  items={expandedMeta}
                  labelColor="blue"
                  variant="compact"
                  labelWidth={130}
                  className="pb-4"
                />
              )}

              {project.photos.length > 1 && (
                <div className="grid gap-3">
                  <Label color="blue">{t('labelGallery')}</Label>
                  <ProjectGallery photos={project.photos} />
                </div>
              )}

              {/*<div className="border-app-line mt-2 border-t pt-5">*/}
              {/*  <AppLink*/}
              {/*    href={routes.project(project.slug)}*/}
              {/*    internal*/}
              {/*    variant="plain"*/}
              {/*    arrow="right"*/}
              {/*    color="blueBright"*/}
              {/*  >*/}
              {/*    {t('caseCta')}*/}
              {/*  </AppLink>*/}
              {/*</div>*/}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*{!expandable && (*/}
      {/*  <AppLink*/}
      {/*    href={routes.project(project.slug)}*/}
      {/*    internal*/}
      {/*    variant="plain"*/}
      {/*    arrow="right"*/}
      {/*    color="blueBright"*/}
      {/*  >*/}
      {/*    {t('caseCta')}*/}
      {/*  </AppLink>*/}
      {/*)}*/}
    </article>
  );
}
