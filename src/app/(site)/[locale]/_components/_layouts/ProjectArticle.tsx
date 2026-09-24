import { useTranslations } from 'next-intl';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { UnderlineLink } from '@/app/(site)/[locale]/_components/_ui/UnderlineLink';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/types/projects';

type Props = {
  project: ProjectData;
  /** 1-based position, rendered as the "01" kicker. */
  index: number;
  /** Mirrors the layout — the design alternates sides down the page. */
  reversed?: boolean;
  isLast?: boolean;
};

export function ProjectArticle({ project, index, reversed = false, isLast = false }: Props) {
  const t = useTranslations('Work');

  const meta: MetaItem[] = [{ label: t('labelRole'), value: project.role }];

  if (project.stack) {
    meta.push({ label: t('labelStack'), value: project.stack });
  }

  if (project.status) {
    meta.push({ label: t('labelStatus'), value: project.status });
  }

  return (
    <article
      data-component="ProjectArticle"
      className={cn(
        'grid items-center gap-[clamp(28px,5vw,72px)]',
        isLast ? 'pb-[clamp(48px,9vh,104px)]' : 'pb-[clamp(64px,12vh,132px)]',
        reversed
          ? 'md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]'
          : 'md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]'
      )}
    >
      <ImageFrame
        photo={project.coverPhoto}
        placeholder={t('coverPlaceholder', { title: project.shortLabel })}
        priority={index === 1}
        sizes="(min-width: 768px) 60vw, 100vw"
        className={reversed ? 'md:order-2' : undefined}
      />

      <div className={cn('grid gap-5', reversed && 'md:order-1')}>
        <div className="text-app-muted flex items-baseline gap-3 font-mono text-xs tracking-wide">
          <span>{String(index).padStart(2, '0')}</span>
          <span className="text-line">/</span>
          <span className="text-ink">{project.shortLabel}</span>
        </div>

        <h3 className="text-[clamp(24px,2.9vw,40px)] leading-tight font-medium tracking-wide text-pretty">
          {project.title}
        </h3>

        <p className="text-app-muted text-[17px] leading-[1.6] text-pretty">{project.context}</p>

        <MetaList items={meta} />

        <UnderlineLink href={routes.project(project.slug)} internal variant="plain" arrow="right">
          {t('caseCta')}
        </UnderlineLink>
      </div>
    </article>
  );
}
