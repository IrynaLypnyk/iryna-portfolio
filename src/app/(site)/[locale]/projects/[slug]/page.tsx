import { ProjectCaseStudy } from '@/app/(site)/[locale]/_components/_layouts/ProjectCaseStudy';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { LocaleType } from '@/i18n/routing';
import { routes } from '@/constants/routes';
import { toProjectDetail } from '@/lib/data/project-mappers';
import {
  getPublishedProjectDetail,
  getDetailProjectNeighbours,
  getAllProjectSlugsForSitemap,
} from '@/lib/data/projects';
import { cache } from 'react';
import { buildAlternates } from '@/lib/seo/config';

type Props = {
  params: Promise<{ locale: LocaleType; slug: string }>;
};

// Prerendered per locale + slug and served from the CDN instead of rendering on every request
// (which streamed the loading skeleton first and fetched the page from iad1). Data comes from
// unstable_cache, which the admin API revalidates by tag on save; `revalidate` is a background fallback.
export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await getAllProjectSlugsForSitemap();
  return projects.map(({ slug }) => ({ slug }));
}

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
