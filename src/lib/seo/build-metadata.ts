import { SITE_CONTENT } from '@/constants/site';
import type { LocaleType } from '@/i18n/routing';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE, buildAlternates } from './config';

type BuildPageMetadataParams = {
  locale: LocaleType;
  pathname: string;
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  absoluteTitle?: boolean;
};

export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  absoluteTitle = false,
}: BuildPageMetadataParams): Metadata {
  const siteName = SITE_CONTENT[locale].siteName;
  const alternates = buildAlternates(pathname, locale);

  const fullTitle = absoluteTitle ? title : `${title} | ${siteName}`;
  const pageDescription = description ?? SITE_CONTENT[locale].siteDescription;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: pageDescription,
    alternates,
    openGraph: {
      type: 'website',
      siteName,
      url: alternates.canonical,
      title: fullTitle,
      description: pageDescription,
      images: [{ url: image }],
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: pageDescription,
      images: [image],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
        nocache: true,
      },
    }),
  };
}
