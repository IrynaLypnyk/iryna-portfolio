import { ExperimentCaseStudy } from '@/app/(site)/[locale]/_components/_layouts/ExperimentCaseStudy';
import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routes } from '@/constants/routes';
import type { LocaleType } from '@/i18n/routing';
import { getAllExperimentSlugsForSitemap, getExperimentDetail } from '@/lib/data/experiments';
import { buildPageMetadata } from '@/lib/seo/build-metadata';

type Props = {
  params: Promise<{ locale: LocaleType; slug: string }>;
};

// Prerendered per locale + slug and served from the CDN instead of rendering on every request
// (which streamed the loading skeleton first and fetched the page from iad1). Data comes from
// unstable_cache, which the admin API revalidates by tag on save; `revalidate` is a background fallback.
export const revalidate = 60;

export async function generateStaticParams() {
  const experiments = await getAllExperimentSlugsForSitemap();
  return experiments.map(({ slug }) => ({ slug }));
}

const loadDetail = cache(getExperimentDetail);

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

  return <ExperimentCaseStudy detail={detail} />;
}
