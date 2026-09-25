'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { Kicker } from '@/app/(site)/[locale]/_components/_ui/Kicker';
import { ProjectFeatures } from '@/app/(site)/[locale]/_components/_ui/ProjectFeatures';
import { ProjectGallery } from '@/app/(site)/[locale]/_components/_ui/ProjectGallery';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';

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

  if (links.length > 0) {
    meta.push({
      label: t('labelLinks'),
      value: (
        // Sits above the card's full-cover toggle button (see below) so these
        // links stay independently clickable instead of triggering expand/collapse.
        <div className="relative z-10 inline-flex flex-wrap gap-x-4 gap-y-1.5">
          {links.map((link) => (
            <AppLink
              key={link.label}
              href={link.href}
              external
              arrow="upRight"
              color="blue"
              fontMono
              className="text-[12px]"
            >
              {link.label}
            </AppLink>
          ))}
        </div>
      ),
    });
  }

  const expandedMeta: MetaItem[] = [];

  if (project.status) {
    expandedMeta.push({ label: t('labelStatus'), value: project.status });
  }

  if (project.yearLabel) {
    expandedMeta.push({ label: t('labelYear'), value: project.yearLabel });
  }

  const expandable = project.features.length > 0 || project.photos.length > 1;

  return (
    <article
      data-component="ProjectArticle"
      className={cn(
        'border-app-line grid gap-5 border-b',
        isLast ? 'pb-[clamp(32px,6vh,64px)]' : 'pb-[clamp(28px,5vh,56px)]'
      )}
    >
      <div
        className={cn(
          'group relative grid items-center gap-[clamp(20px,3.5vw,48px)] pt-[clamp(28px,5vh,56px)] md:grid-cols-[minmax(160px,220px)_minmax(0,1fr)_auto]',
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
            className="absolute inset-0 z-0 border-0 bg-transparent p-0"
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
              'text-[clamp(22px,2.6vw,34px)] leading-tight font-medium tracking-wide text-pretty transition-colors',
              expandable && 'group-hover:text-app-accent'
            )}
          >
            {project.title}
          </h3>

          <p className="text-app-muted text-[17px] leading-[1.6] text-pretty">{project.context}</p>

          <MetaList items={meta} />
        </div>

        {expandable && (
          <div
            aria-hidden="true"
            className="border-app-accent-bright text-app-accent-bright group-hover:bg-app-accent-bright flex h-9 w-9 shrink-0 items-center justify-center border transition-colors group-hover:text-white md:justify-self-end"
          >
            {open ? <Minus size={16} strokeWidth={1.75} /> : <Plus size={16} strokeWidth={1.75} />}
          </div>
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
            className="overflow-hidden"
          >
            <div className="grid gap-6 pb-2">
              {expandedMeta.length > 0 && <MetaList items={expandedMeta} />}

              {project.features.length > 0 && (
                <div className="grid gap-3">
                  <Kicker as="h4">{t('labelFeatures')}</Kicker>
                  <ProjectFeatures features={project.features} />
                </div>
              )}

              {project.photos.length > 1 && (
                <div className="grid gap-3">
                  <Kicker as="h4">{t('labelGallery')}</Kicker>
                  <ProjectGallery photos={project.photos} />
                </div>
              )}

              <div className="border-app-line mt-2 border-t pt-5">
                <AppLink
                  href={routes.project(project.slug)}
                  internal
                  variant="plain"
                  arrow="right"
                  color="blueBright"
                >
                  {t('caseCta')}
                </AppLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!expandable && (
        <AppLink
          href={routes.project(project.slug)}
          internal
          variant="plain"
          arrow="right"
          color="blueBright"
        >
          {t('caseCta')}
        </AppLink>
      )}
    </article>
  );
}
