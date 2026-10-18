import { ProjectCaseStudy } from '@/app/(site)/[locale]/projects/[slug]/_components/ProjectCaseStudy';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { LocaleType } from '@/i18n/routing';
import { routes } from '@/constants/routes';
import { toProjectDetail } from '@/lib/data/project-mappers';
import { getPublishedProjectDetail, getDetailProjectNeighbours } from '@/lib/data/projects';
import { cache } from 'react';
export const dynamic = 'force-dynamic';
import { buildAlternates } from '@/lib/seo/config';

type Props = {
  params: Promise<{ locale: LocaleType; slug: string }>;
};

const loadDetail = cache(async (slug: string, locale: LocaleType) => {
  const project = await getPublishedProjectDetail(slug);
  if (!project) return null;
  return toProjectDetail(project, await getDetailProjectNeighbours(), locale);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const detail = await loadDetail(slug, locale);

  if (!detail) {
    notFound();
  }

  return {
    title: detail.title,
    ...(detail.lead ? { description: detail.lead } : {}),
    alternates: buildAlternates(routes.project(slug), locale),
    openGraph: {
      title: detail.title,
      ...(detail.lead ? { description: detail.lead } : {}),
      ...(detail.coverPhoto ? { images: [{ url: detail.coverPhoto.src }] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const detail = await loadDetail(slug, locale);

  if (!detail) {
    notFound();
  }

  return <ProjectCaseStudy detail={detail} />;
}
