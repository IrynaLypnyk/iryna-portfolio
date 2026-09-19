import { JsonLd } from '@/app/(site)/[locale]/_components/seo/JsonLd';
import { routing, type LocaleType } from '@/i18n/routing';
import { SITE_URL, IS_SITE_LIVE, buildLocaleUrl } from '@/lib/seo/config';
import { buildPersonJsonLd, buildWebSiteJsonLd } from '@/lib/seo/json-ld';
import { cn } from '@/lib/utils';
import '@/styles/index.css';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import { PERSON_CONTENT } from '@/constants/content';
import { SITE_CONTENT } from '@/constants/site';
import { sans, mono } from '@/fonts';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const currentLocale = locale as LocaleType;

  const { siteName, siteDescription } = SITE_CONTENT[currentLocale];
  const siteTitle = PERSON_CONTENT[currentLocale].jobTitle;

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: `${siteName} — ${siteTitle}`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    icons: {
      icon: [
        { url: '/favicon/favicon.ico' },
        {
          url: '/favicon/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: '/favicon/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
        },
      ],
      apple: [
        {
          url: '/favicon/apple-touch-icon.png',
          sizes: '180x180',
        },
      ],
    },

    manifest: '/favicon/site.webmanifest',

    robots: IS_SITE_LIVE
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
          nocache: true,
        },
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  const currentLocale = locale as LocaleType;
  const person = PERSON_CONTENT[currentLocale];
  const alternateLocale: LocaleType = currentLocale === 'en' ? 'uk' : 'en';

  const personJsonLd = buildPersonJsonLd({
    name: person.name,
    alternateName: PERSON_CONTENT[alternateLocale].name,
    jobTitle: person.jobTitle,
    location: person.location,
    url: buildLocaleUrl(currentLocale),
  });

  const site = SITE_CONTENT[currentLocale];

  const websiteJsonLd = buildWebSiteJsonLd({
    name: site.siteName,
    url: buildLocaleUrl(currentLocale),
  });

  return (
    <html
      lang={locale}
      className={cn('scroll-smooth', sans.variable, mono.variable)}
      data-scroll-behavior="smooth"
    >
      <body
        className="bg-paper flex min-h-dvh flex-col font-sans antialiased"
        suppressHydrationWarning
      >
        <JsonLd data={[personJsonLd, websiteJsonLd]} />
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
