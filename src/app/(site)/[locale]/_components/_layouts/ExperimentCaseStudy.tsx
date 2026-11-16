import { CaseStudyLayout } from './CaseStudyLayout';
import { useTranslations } from 'next-intl';
import type { ExperimentData } from '@/types/experiments';
import { type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { ProjectStack } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectStack';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { anchors, routes } from '@/constants/routes';
export function ExperimentCaseStudy({
  detail,
}: {
  detail: { experiment: ExperimentData; next: { slug: string; title: string } | null };
}) {
  const { experiment, next } = detail;
  const t = useTranslations('Playground');
  const tWork = useTranslations('Work');
  const backHref = `${routes.home}#${anchors.playground}`;
  const stack =
    experiment.stack
      ?.split(/[·,]/)
      .map((item) => item.trim())
      .filter(Boolean) ?? [];
  const meta: MetaItem[] = [];
  if (stack.length) {
    meta.push({ label: tWork('labelStack'), value: <ProjectStack items={stack} /> });
  }
  if (experiment.demoUrl || experiment.githubUrl) {
    meta.push({
      label: tWork('labelLinks'),
      value: (
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {experiment.demoUrl && (
            <AppLink href={experiment.demoUrl} external arrow="upRight" color="blueBright">
              {t('demoLabel')}
            </AppLink>
          )}
          {experiment.githubUrl && (
            <AppLink href={experiment.githubUrl} external arrow="upRight" color="blueBright">
              {t('githubLabel')}
            </AppLink>
          )}
        </div>
      ),
    });
  }

  return (
    <CaseStudyLayout
      componentName="ExperimentCaseStudy"
      title={experiment.title}
      description={experiment.shortDescription}
      cover={experiment.cover}
      meta={meta}
      sections={experiment.blocks ?? []}
      photos={experiment.photos}
      galleryLabel={t('gallery')}
      backHref={backHref}
      backLabel={t('backToExperiments')}
      next={next ? { href: routes.experiment(next.slug), title: next.title } : null}
      nextLabel={t('nextExperiment')}
    />
  );
}
