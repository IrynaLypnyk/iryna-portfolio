import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { anchors, routes } from '@/constants/routes';
import type { LocaleType } from '@/i18n/routing';
import { getPublishedExperiments } from '@/lib/data/experiments';
import { buildPageMetadata } from '@/lib/seo/build-metadata';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: LocaleType }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Playground' });

  return buildPageMetadata({
    locale,
    pathname: routes.playground,
    title: t('title'),
    description: t('intro'),
  });
}

export default async function PlaygroundPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [experiments, t] = await Promise.all([
    getPublishedExperiments(locale),
    getTranslations('Playground'),
  ]);

  return (
    <div data-component="PlaygroundPage" className="pb-[clamp(72px,12vh,140px)]">
      <section className="grid gap-[clamp(20px,3vh,32px)] pt-[clamp(48px,9vh,104px)] pb-[clamp(40px,7vh,80px)]">
        <AppLink
          href={`${routes.home}#${anchors.playground}`}
          internal
          arrow="left"
          arrowPosition="before"
          color="gray"
          fontMono
        >
          {t('backToWork')}
        </AppLink>

        <h1 className="text-[clamp(40px,6.4vw,88px)] leading-none font-medium tracking-tight">
          {t('title')}
        </h1>

        <p className="text-app-muted max-w-xl text-lg leading-[1.6] text-pretty">{t('intro')}</p>
      </section>

      {experiments.length === 0 ? (
        <p className="text-app-muted pb-16 text-[17px]">{t('empty')}</p>
      ) : (
        <div className="grid gap-[clamp(48px,9vh,104px)]">
          {experiments.map((experiment) => (
            <article
              key={experiment.slug}
              id={`exp-${experiment.slug}`}
              className="border-app-line grid scroll-mt-(--header-height) items-start gap-[clamp(24px,4vw,56px)] border-t pt-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]"
            >
              <ImageFrame
                photo={experiment.cover}
                placeholder={t('coverPlaceholder', { title: experiment.title })}
                sizes="(min-width: 768px) 55vw, 100vw"
                className="aspect-16/10"
              />

              <div className="grid gap-4">
                <span className="text-app-muted font-mono text-xs tracking-wide">
                  {experiment.index}
                </span>

                <h2 className="text-[clamp(24px,2.6vw,34px)] leading-[1.1] font-medium tracking-tight">
                  {experiment.title}
                </h2>

                <p className="text-app-muted text-[16.5px] leading-[1.6] text-pretty">
                  {experiment.description}
                </p>

                {experiment.stack && (
                  <span className="text-app-accent font-mono text-xs">{experiment.stack}</span>
                )}

                {(experiment.demoUrl || experiment.githubUrl) && (
                  <div className="flex flex-wrap gap-x-5.5 gap-y-1.5">
                    {experiment.demoUrl && (
                      <AppLink
                        href={experiment.demoUrl}
                        external
                        arrow="upRight"
                        variant="underline"
                        color="black"
                        fontMono
                      >
                        {t('demoLabel')}
                      </AppLink>
                    )}

                    {experiment.githubUrl && (
                      <AppLink
                        href={experiment.githubUrl}
                        external
                        arrow="upRight"
                        variant="underline"
                        color="black"
                        fontMono
                      >
                        {t('githubLabel')}
                      </AppLink>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
