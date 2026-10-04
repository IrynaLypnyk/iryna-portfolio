import { routing, type LocaleType } from '@/i18n/routing';

const FALLBACK_SITE_URL = 'http://localhost:3000';

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL || FALLBACK_SITE_URL);

export const DEFAULT_OG_IMAGE = '/images/og/og-image.png';

/**
 * Controls whether search engines may index the site.
 * Set `SITE_IS_LIVE=true` in production after launch.
 */
export const IS_SITE_LIVE = process.env.SITE_IS_LIVE === 'true';

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function buildLocaleUrl(locale: LocaleType, pathname = ''): string {
  return `${SITE_URL}/${locale}${normalizePathname(pathname)}`;
}

export type LocalizedAlternates = {
  canonical: string;
  languages: Record<LocaleType | 'x-default', string>;
};

export function buildAlternates(pathname: string, locale: LocaleType): LocalizedAlternates {
  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, buildLocaleUrl(loc, pathname)])
  ) as Record<LocaleType, string>;

  return {
    canonical: buildLocaleUrl(locale, pathname),
    languages: {
      ...languages,
      'x-default': buildLocaleUrl(routing.defaultLocale, pathname),
    },
  };
}
