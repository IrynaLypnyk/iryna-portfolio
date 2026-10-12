import { routing, type LocaleType } from '@/i18n/routing';
import { routes } from '@/constants/routes';
import { buildLocaleUrl } from '@/lib/seo/config';
import type { MetadataRoute } from 'next';
import { getPublishedExperiments } from '@/lib/data/experiments';

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
 * Experiments have their own localized case studies; the Playground overview
 * redirects to the home section and should not be indexed separately.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const experiments = await getPublishedExperiments(routing.defaultLocale);
  return [
    ...buildEntriesForPathname(''),
    ...experiments.flatMap((experiment) =>
      buildEntriesForPathname(routes.experiment(experiment.slug))
    ),
  ];
}
