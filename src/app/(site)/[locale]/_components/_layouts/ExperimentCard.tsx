import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { routes } from '@/constants/routes';
import type { ExperimentData } from '@/types/experiments';

type Props = {
  experiment: ExperimentData;
};

/** Compact Playground teaser card on the home page; links to the full article on `/playground`. */
export function ExperimentCard({ experiment }: Props) {
  const t = useTranslations('Playground');

  return (
    <Link
      href={`${routes.playground}#exp-${experiment.slug}`}
      data-component="ExperimentCard"
      className="project-placeholder border-app-line hover:border-app-accent-bright/30 grid min-h-49 gap-3.5 border p-5.5 transition-colors"
    >
      <div className="text-app-muted flex items-baseline justify-between font-mono text-xs tracking-wide">
        <span>{t('expLabel', { index: experiment.index })}</span>
        <span aria-hidden="true" className="text-app-accent-bright font-sans text-[18px]">
          ↗
        </span>
      </div>

      <div className="grid content-start gap-2">
        <span className="text-app-ink text-xl leading-tight font-medium tracking-tight">
          {experiment.title}
        </span>
        <span className="text-app-muted text-[15px] leading-[1.55] text-pretty">
          {experiment.description}
        </span>
      </div>

      {experiment.stack && (
        <span className="text-app-accent font-mono text-xs">{experiment.stack}</span>
      )}
    </Link>
  );
}
