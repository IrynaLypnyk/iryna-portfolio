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

  return (
    <Link
      href={routes.experiment(experiment.slug)}
      prefetch
      data-component="ExperimentCard"
      className="project-placeholder border-app-line hover:border-app-accent-bright/30 grid min-h-49 gap-3.5 border p-5.5 transition-colors"
    >
      <div className="text-app-muted flex items-baseline justify-between font-mono text-xs tracking-wide">
        <span>{t('expLabel', { index: experiment.index })}</span>
        <ExperimentLinkIndicator loadingLabel={t('loading')} />
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
    </Link>
  );
}
