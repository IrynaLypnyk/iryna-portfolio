'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { ProjectFeatures } from '@/app/(site)/[locale]/_components/_ui/ProjectFeatures';
import { ProjectGallery } from '@/app/(site)/[locale]/_components/_ui/ProjectGallery';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import { ActionBox } from '@/app/(site)/[locale]/_components/_ui/ActionBox';

type Props = {
  project: ProjectData;
  /** 1-based position, rendered as the "01" kicker. */
  index: number;
  isLast?: boolean;
};

export function ProjectArticle({ project, index, isLast = false }: Props) {
  const t = useTranslations('Work');
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const meta: MetaItem[] = [{ label: t('labelRole'), value: project.role }];

  if (project.stack) {
    meta.push({ label: t('labelStack'), value: project.stack });
  }

  const links = [
    project.externalUrl && {
      href: project.externalUrl,
      label: project.linkLabel ?? t('demoLabel'),
    },
    project.githubUrl && { href: project.githubUrl, label: t('githubLabel') },
    project.storybookUrl && { href: project.storybookUrl, label: t('storybookLabel') },
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  const expandedMeta: MetaItem[] = [];

  if (project.status) {
    meta.push({ label: t('labelStatus'), value: project.status });
  }

  if (project.yearLabel) {
    meta.push({ label: t('labelYear'), value: project.yearLabel });
  }

  if (project.features.length > 0) {
    expandedMeta.push({
      label: t('labelFeatures'),
      value: <ProjectFeatures features={project.features} />,
    });
  }
  const expandable = project.features.length > 0 || project.photos.length > 1;

  return (
    <article
      data-component="ProjectArticle"
      className={cn(
        'border-app-line -mr-(--page-pad-right) grid gap-7 overflow-visible border-b',
        isLast ? 'pb-[clamp(32px,6vh,64px)]' : 'pb-[clamp(28px,5vh,56px)]'
      )}
    >
      <div
        className={cn(
          'group relative grid items-start gap-[clamp(20px,3.5vw,48px)] pt-[clamp(28px,5vh,56px)] pr-(--page-pad-right) md:grid-cols-[minmax(160px,220px)_minmax(0,1fr)_auto]',
          expandable && 'cursor-pointer'
        )}
      >
        {expandable && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? t('hideDetails') : t('showDetails')}: ${project.title}`}
            onClick={() => setOpen((current) => !current)}
            className="absolute inset-0 z-0 cursor-pointer border-0 bg-transparent p-0"
          />
        )}

        <ImageFrame
          photo={project.coverPhoto}
          placeholder={t('coverPlaceholder', { title: project.shortLabel })}
          priority={index === 1}
          sizes="(min-width: 768px) 20vw, 40vw"
          className="aspect-4/3"
        />

        <div className="grid gap-4">
          <div className="text-app-muted flex items-baseline gap-3 font-mono text-xs tracking-wide">
            <span>{String(index).padStart(2, '0')}</span>
            <span className="text-line">/</span>
            <span className="text-ink">{project.shortLabel}</span>
          </div>

          <h3
            className={cn(
              'text-[clamp(22px,2.6vw,34px)] leading-tight font-medium tracking-normal text-pretty transition-colors',
              expandable && 'group-hover:text-app-ink'
            )}
          >
            {project.title}
          </h3>

          <p className="text-app-muted text-[17px] leading-[1.6] text-pretty">{project.context}</p>

          <MetaList items={meta} variant="compact" labelColor="blue" />

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
        </div>

        {expandable && (
          <ActionBox>
            {open ? <Minus size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
          </ActionBox>
        )}
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
            <div className="grid gap-6 pb-4">
              {expandedMeta.length > 0 && (
                <MetaList
                  items={expandedMeta}
                  labelColor="blue"
                  variant="panel"
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
