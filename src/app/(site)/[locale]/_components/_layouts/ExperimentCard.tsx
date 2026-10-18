'use client';
import { useId, useState } from 'react';
import { ImagesGallery } from '../_ui/ImagesGallery';
import { AppLink } from '../_ui/AppLink';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { routes } from '@/constants/routes';
import type { ExperimentData } from '@/types/experiments';
import { ProjectStack } from './ProjectArticle/ProjectStack';
import { ExperimentLinkIndicator } from './ExperimentLinkIndicator';

type Props = {
  experiment: ExperimentData;
};

/** Compact Playground teaser card linking to the experiment's own case study. */
export function ExperimentCard({ experiment }: Props) {
  const t = useTranslations('Playground');
  const work = useTranslations('Work');
  const [open, setOpen] = useState(false);
  const panel = useId();

  const content = (
    <>
      <div className="text-app-muted flex items-baseline justify-between font-mono text-xs tracking-wide">
        <span>{t('expLabel', { index: experiment.index })}</span>
        {experiment.hasDetailPage ? (
          <ExperimentLinkIndicator loadingLabel={t('loading')} />
        ) : (
          <span aria-hidden="true">{open ? '−' : '+'}</span>
        )}
      </div>

      <div className="grid content-start gap-2">
        <span className="text-app-ink text-xl leading-none font-medium tracking-tight">
          {experiment.title}
        </span>
        {experiment.shortDescription && (
          <span className="text-app-muted text-[15px] leading-[1.55] text-pretty">
            {experiment.shortDescription}
          </span>
        )}
      </div>

      {experiment.stack && (
        <ProjectStack
          items={experiment.stack
            .split(/[·,]/)
            .map((item) => item.trim())
            .filter(Boolean)}
          size="sm"
          color="blue"
        />
      )}
    </>
  );
  const cardClass =
    'project-placeholder border-app-line hover:border-app-accent-bright/30 grid min-h-49 gap-3.5 border p-5.5 transition-colors';
  if (experiment.hasDetailPage)
    return (
      <Link
        href={routes.experiment(experiment.slug)}
        prefetch
        data-component="ExperimentCard"
        className={cardClass}
      >
        {content}
      </Link>
    );
  return (
    <article data-component="ExperimentCard" className={cardClass}>
      <button
        type="button"
        className="grid gap-3.5 text-left focus-visible:outline-2 focus-visible:outline-blue-600"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen((value) => !value)}
      >
        {content}
        <span className="sr-only">{open ? work('hideDetails') : work('showDetails')}</span>
      </button>
      <div id={panel} hidden={!open} className="grid min-w-0 gap-5">
        {experiment.description && (
          <p className="text-app-muted whitespace-pre-line">{experiment.description}</p>
        )}
        <ImagesGallery photos={experiment.photos} imageHeightClass="h-40" />
        {(experiment.demoUrl || experiment.githubUrl) && (
          <div className="flex flex-wrap gap-4">
            {experiment.demoUrl && (
              <AppLink href={experiment.demoUrl} external color="blueBright">
                {t('demoLabel')}
              </AppLink>
            )}
            {experiment.githubUrl && (
              <AppLink href={experiment.githubUrl} external color="blueBright">
                {t('githubLabel')}
              </AppLink>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
