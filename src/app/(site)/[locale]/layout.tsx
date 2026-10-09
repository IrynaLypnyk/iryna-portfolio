import { JsonLd } from '@/app/(site)/[locale]/_components/_seo/JsonLd';
import { routing, type LocaleType } from '@/i18n/routing';
import { SITE_URL, IS_SITE_LIVE, buildLocaleUrl, DEFAULT_OG_IMAGE } from '@/lib/seo/config';
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
import { SiteHeader } from '@/app/(site)/[locale]/_components/_layouts/SiteHeader';
import { GrowingThread } from '@/app/(site)/[locale]/_components/_ui/GrowingThread';
import { SiteFooter } from '@/app/(site)/[locale]/_components/_layouts/SiteFooter';
import { PageContainer } from '@/app/(site)/[locale]/_components/_ui/PageContainer';
import { anchors } from '@/constants/routes';
import { BackToTopButton } from '@/app/(site)/[locale]/_components/_ui/BackToTopButton';

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

    openGraph: {
      type: 'website',
      siteName,
      url: buildLocaleUrl(currentLocale),
      title: `${siteName} — ${siteTitle}`,
      description: siteDescription,
      images: [{ url: `${SITE_URL}${DEFAULT_OG_IMAGE}` }],
    },

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
        className="bg-app-page text-app-text flex min-h-dvh flex-col font-sans text-base leading-normal font-normal antialiased"
        suppressHydrationWarning
      >
        <JsonLd data={[personJsonLd, websiteJsonLd]} />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SiteHeader />
          <GrowingThread className="hidden md:block" />
          <PageContainer as="main" id={anchors.top} className="flex-1">
            {children}
          </PageContainer>
          <SiteFooter />
          <BackToTopButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
