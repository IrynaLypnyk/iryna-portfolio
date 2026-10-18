import { ExperimentCaseStudy } from '@/app/(site)/[locale]/projects/[slug]/_components/ExperimentCaseStudy';
import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routes } from '@/constants/routes';
import type { LocaleType } from '@/i18n/routing';
import { getExperimentDetail } from '@/lib/data/experiments';
import { buildPageMetadata } from '@/lib/seo/build-metadata';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: LocaleType; slug: string }>;
};

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
