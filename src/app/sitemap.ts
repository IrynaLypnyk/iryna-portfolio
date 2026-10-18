import { routing, type LocaleType } from '@/i18n/routing';
import { routes } from '@/constants/routes';
import { buildLocaleUrl } from '@/lib/seo/config';
import type { MetadataRoute } from 'next';
import { getAllProjectSlugsForSitemap } from '@/lib/data/projects';
import { getAllExperimentSlugsForSitemap } from '@/lib/data/experiments';

export const revalidate = 60;

function buildLanguageAlternates(pathname: string): Record<LocaleType, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, buildLocaleUrl(locale, pathname)])
  ) as Record<LocaleType, string>;
}

function buildEntriesForPathname(
  pathname: string,
  lastModified?: Date | string
): MetadataRoute.Sitemap {
  const languages = buildLanguageAlternates(pathname);

  return routing.locales.map((locale) => ({
    url: buildLocaleUrl(locale, pathname),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  }));
}

/**
 * Only published detail pages have localized case-study entries; the Playground overview
 * redirects to the home section and should not be indexed separately.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [experiments, projects] = await Promise.all([
    getAllExperimentSlugsForSitemap(),
    getAllProjectSlugsForSitemap(),
  ]);
  return [
    ...buildEntriesForPathname(''),
    ...projects.flatMap((project) =>
      buildEntriesForPathname(routes.project(project.slug), project.updatedAt)
    ),
    ...experiments.flatMap((experiment) =>
      buildEntriesForPathname(routes.experiment(experiment.slug), experiment.updatedAt)
    ),
  ];
}
