import { useTranslations } from 'next-intl';
import type { ExperimentData } from '@/types/experiments';
import { Link } from '@/i18n/navigation';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { ImagesGallery } from '@/app/(site)/[locale]/_components/_ui/ImagesGallery';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { ProjectStack } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectStack';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import { CaseSection } from './CaseSection';
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
            <AppLink
              href={experiment.demoUrl}
              external
              arrow="upRight"
              variant="underline"
              color="blueBright"
            >
              {t('demoLabel')}
            </AppLink>
          )}
          {experiment.githubUrl && (
            <AppLink
              href={experiment.githubUrl}
              external
              arrow="upRight"
              variant="underline"
              color="blueBright"
            >
              {t('githubLabel')}
            </AppLink>
          )}
        </div>
      ),
    });
  }

  return (
    <article data-component="ExperimentCaseStudy">
      <section className="pt-[clamp(48px,9vh,104px)] pb-[clamp(32px,6vh,64px)]">
        <AppLink href={backHref} internal arrow="left" arrowPosition="before" color="gray" fontMono>
          {t('backToExperiments')}
        </AppLink>
        <div className="grid items-start gap-[clamp(32px,6vw,88px)] pt-[clamp(20px,4vh,44px)] md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <div className="grid min-w-0 gap-6">
            <div className="text-muted flex items-baseline gap-3 font-mono text-xs tracking-[0.12em]">
              <span>{t('expLabel', { index: experiment.index })}</span>
              <span className="text-accent-pale">/</span>
              <span className="text-ink">{t('title')}</span>
            </div>
            <ImageFrame photo={experiment.cover} compact priority />
            <h1 className="text-[clamp(32px,4vw,56px)] leading-[1.08] font-semibold tracking-[-0.038em] wrap-break-word">
              {experiment.title}
            </h1>
            {experiment.shortDescription && (
              <p className="text-muted max-w-165 text-[clamp(17px,1.5vw,19px)] leading-[1.68] text-pretty">
                {experiment.shortDescription}
              </p>
            )}
            {experiment.description && (
              <p className="text-muted max-w-165 text-[clamp(17px,1.5vw,19px)] leading-[1.68] text-pretty whitespace-pre-line">
                {experiment.description}
              </p>
            )}
          </div>
          {meta.length > 0 && <MetaList variant="panel" labelColor="blue" items={meta} />}
        </div>
      </section>

      {!!experiment.blocks?.length && (
        <section className="grid gap-[clamp(40px,7vh,80px)] pt-[clamp(56px,10vh,128px)]">
          {experiment.blocks.map((block) => (
            <CaseSection key={block.id} section={block} />
          ))}
        </section>
      )}

      {experiment.photos.length > 0 && (
        <section className="grid min-w-0 gap-6 pt-[clamp(56px,10vh,120px)]">
          <Label color="blue">{t('gallery')}</Label>
          <ImagesGallery photos={experiment.photos} />
        </section>
      )}

      <section className="pt-[clamp(56px,10vh,120px)] pb-[clamp(72px,12vh,140px)]">
        <div className="border-line flex flex-wrap items-center justify-between gap-6 border-t pt-6.5">
          <AppLink href={backHref} internal arrow="left" arrowPosition="before" color="gray">
            {t('backToExperiments')}
          </AppLink>
          {next && (
            <Link
              href={routes.experiment(next.slug)}
              className="text-ink hover:text-accent min-h-11 text-right text-[clamp(18px,2vw,26px)] tracking-[-0.02em] transition-colors"
            >
              {t('nextExperiment')}: {next.title} →
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}
