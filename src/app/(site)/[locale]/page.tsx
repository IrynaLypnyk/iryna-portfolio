import { setRequestLocale } from 'next-intl/server';
import type { LocaleType } from '@/i18n/routing';
import { buildPageMetadata } from '@/lib/seo/build-metadata';
import { PERSON_CONTENT } from '@/constants/content';
import { SITE_CONTENT } from '@/constants/site';
import type { Metadata } from 'next';
import { Hero } from '@/app/(site)/[locale]/_components/_sections/Hero';
import { About } from '@/app/(site)/[locale]/_components/_sections/About';
import { Contact } from '@/app/(site)/[locale]/_components/_sections/Contact';
import { Projects } from '@/app/(site)/[locale]/_components/_sections/Projects';
import { Playground } from '@/app/(site)/[locale]/_components/_sections/Playground';
import { getPublishedProjects } from '@/lib/projects/get-published-projects';
import { getPublishedExperiments } from '@/lib/data/experiments';
import { HashScroll } from '@/app/(site)/[locale]/_components/_ui/HashScroll';

export const dynamic = 'force-dynamic';

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

  const [projects, experiments] = await Promise.all([
    getPublishedProjects(locale),
    getPublishedExperiments(locale),
  ]);

  return (
    <div>
      <HashScroll />

      <Hero />
      <Projects projects={projects} />
      <Playground experiments={experiments} />
      <About />
      <Contact />
    </div>
  );
}
