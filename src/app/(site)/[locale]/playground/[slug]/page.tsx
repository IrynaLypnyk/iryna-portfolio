import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { ImagesGallery } from '@/app/(site)/[locale]/_components/_ui/ImagesGallery';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { ProjectStack } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectStack';
import { anchors, routes } from '@/constants/routes';
import { Link } from '@/i18n/navigation';
import type { LocaleType } from '@/i18n/routing';
import { getPublishedExperiments } from '@/lib/data/experiments';
import { buildPageMetadata } from '@/lib/seo/build-metadata';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: LocaleType; slug: string }>;
};

const loadDetail = cache(async (slug: string, locale: LocaleType) => {
  const experiments = await getPublishedExperiments(locale);
  const position = experiments.findIndex((experiment) => experiment.slug === slug);
  if (position === -1) return null;

  return {
    experiment: experiments[position],
    next: experiments.length > 1 ? experiments[(position + 1) % experiments.length] : null,
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const detail = await loadDetail(slug, locale);
  if (!detail) notFound();

  return buildPageMetadata({
    locale,
    pathname: routes.experiment(slug),
    title: detail.experiment.title,
    description: detail.experiment.shortDescription || detail.experiment.description,
    image: detail.experiment.cover?.src,
  });
}

export default async function ExperimentPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const detail = await loadDetail(slug, locale);
  if (!detail) notFound();

  const { experiment, next } = detail;
  const [t, tWork] = await Promise.all([getTranslations('Playground'), getTranslations('Work')]);
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
            <h1 className="text-[clamp(40px,6.4vw,88px)] leading-[0.94] font-semibold tracking-[-0.038em] wrap-break-word">
              {experiment.title}
            </h1>
            {experiment.shortDescription && (
              <p className="text-muted max-w-165 text-[clamp(17px,1.5vw,19px)] leading-[1.68] text-pretty">
                {experiment.shortDescription}
              </p>
            )}
          </div>
          {meta.length > 0 && <MetaList variant="panel" labelColor="blue" items={meta} />}
        </div>
      </section>

      <ImageFrame
        photo={experiment.cover}
        placeholder={t('coverPlaceholder', { title: experiment.title })}
        priority
        sizes="(min-width: 1280px) 1280px, 100vw"
        className="aspect-video"
      />

      {experiment.description && (
        <section className="pt-[clamp(56px,10vh,128px)]">
          <div className="border-line grid items-start gap-[clamp(24px,5vw,64px)] border-t pt-5.5 md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)]">
            <h2 className="text-[clamp(20px,2vw,26px)] leading-[1.2] font-medium tracking-[-0.022em]">
              {t('overview')}
            </h2>
            <div className="grid max-w-170 gap-3.5">
              {experiment.description
                .split(/\n\s*\n/)
                .filter((paragraph) => paragraph.trim())
                .map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-ink-soft text-[17px] leading-[1.72] text-pretty whitespace-pre-line"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
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
