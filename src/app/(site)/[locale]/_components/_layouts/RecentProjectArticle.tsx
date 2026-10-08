'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useProjectMeta } from '@/hooks/useProjectMeta';
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
};

export function RecentProjectArticle({ project, index }: Props) {
  const t = useTranslations('Work');
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const meta = useProjectMeta(project);

  const links = [
    project.externalUrl && {
      href: project.externalUrl,
      label: project.linkLabel ?? t('demoLabel'),
    },
    project.githubUrl && { href: project.githubUrl, label: t('githubLabel') },
    project.storybookUrl && { href: project.storybookUrl, label: t('storybookLabel') },
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  const expandedMeta: MetaItem[] = [];

  if (project.features.length > 0) {
    expandedMeta.push({
      label: t('labelFeatures'),
      value: <ProjectFeatures features={project.features} />,
    });
  }
  const expandable = project.features.length > 0 || project.photos.length > 1;

  const showMoreButton = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={`${open ? t('hideDetails') : t('showDetails')}: ${project.title}`}
      onClick={() => setOpen((current) => !current)}
      className="cursor-pointer"
    >
      <ActionBox>
        {open ? <Minus size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
      </ActionBox>
    </button>
  );

  return (
    <article
      data-component="RecentProjectArticle"
      className={cn(
        'border-app-line grid gap-7 overflow-visible border-b pr-(--page-pad-right) pb-[clamp(28px,5vh,56px)] first:border-t last:border-b last:pb-[clamp(32px,6vh,64px)]'
      )}
    >
      <div
        className={cn(
          'group relative grid items-start gap-[clamp(20px,3.5vw,48px)] pt-[clamp(28px,5vh,56px)]',
          expandable
            ? 'md:grid-cols-[auto_minmax(0,1fr)_minmax(160px,220px)]'
            : 'md:grid-cols-[minmax(0,1fr)_minmax(160px,220px)]'
        )}
      >
        {/* only Desktop */}
        {expandable && <div className="hidden md:inline-block">{showMoreButton}</div>}

        <div className="grid gap-4">
          <h3
            className={cn(
              'text-[clamp(22px,2.6vw,34px)] leading-tight font-medium tracking-normal text-pretty transition-colors',
              expandable && 'group-hover:text-app-ink'
            )}
          >
            {project.title}
          </h3>

          <p className="text-app-muted text-[17px] leading-[1.6] text-pretty">{project.context}</p>

          <MetaList items={meta} variant="compact" labelColor="gray" labelWidth={120} />

          {links.length > 0 && (
            <div className="relative inline-flex flex-wrap gap-x-4 gap-y-1.5">
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

        <ImageFrame
          photo={project.coverPhoto}
          placeholder={t('coverPlaceholder', { title: project.shortLabel })}
          priority={index === 1}
          sizes="(min-width: 768px) 20vw, 40vw"
          className="aspect-4/3"
        />

        {/* here only Mobile */}
        {expandable && <div className="inline-block md:hidden">{showMoreButton}</div>}
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
