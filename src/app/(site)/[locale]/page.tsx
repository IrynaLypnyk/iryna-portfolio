import { setRequestLocale } from 'next-intl/server';
import type { LocaleType } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/seo/build-metadata';
import { PERSON_CONTENT } from '@/constants/content';
import { SITE_CONTENT } from '@/constants/site';
import type { Metadata } from 'next';


type Props = {
  params: Promise<{ locale: LocaleType }>;
};

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const { siteName, siteDescription } = SITE_CONTENT[locale];
  const jobTitle = PERSON_CONTENT[locale].jobTitle;

  return buildPageMetadata({
    locale,
    pathname: '',
    title: `${siteName} — ${jobTitle}`,
    description: siteDescription,
    absoluteTitle: true,
  });
}


export default async function IndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>IndexPage</div>
  );
}
