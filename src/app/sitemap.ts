import { routing, type LocaleType } from '@/i18n/routing';
import { routes } from '@/constants/routes';
import { buildLocaleUrl } from '@/lib/seo/config';
import type { MetadataRoute } from 'next';

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
 * The public site is a one-pager plus a case-study page per published project,
 * so the sitemap is the home page, the Playground page, and whatever project
 * is currently published.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [...buildEntriesForPathname(''), ...buildEntriesForPathname(routes.playground)];
}
