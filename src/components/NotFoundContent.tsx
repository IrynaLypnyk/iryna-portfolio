import Link from 'next/link';
import { AccentButton } from '@/app/(site)/[locale]/_components/_ui/AccentButton';
import { AppLink, ARROWS } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { Kicker } from '@/app/(site)/[locale]/_components/_ui/Kicker';
import type { LocaleType } from '@/i18n/routing';
import { anchors } from '@/constants/routes';

const content = {
  en: {
    label: 'Error / Page not found',
    title: 'This page got lost.',
    description: "Looks like this page took a wrong turn. Let's get you back on track.",
    home: 'Go home',
    projects: 'Explore my projects',
  },
  uk: {
    label: 'Помилка / Сторінку не знайдено',
    title: 'Ця сторінка загубилася.',
    description: 'Схоже, ця сторінка звернула не туди. Повернімося на правильний шлях.',
    home: 'На головну',
    projects: 'Переглянути проєкти',
  },
} satisfies Record<LocaleType, Record<string, string>>;

export function NotFoundContent({ locale = 'en' }: { locale?: LocaleType }) {
  const t = content[locale];

  return (
    <section
      data-component="NotFoundContent"
      aria-labelledby="not-found-title"
      className="flex w-full flex-1 flex-col items-center justify-center py-8 text-center"
    >
      <Kicker as="p" className="mb-4">
        {t.label}
      </Kicker>
      <p
        aria-hidden="true"
        className="text-app-accent-bright font-mono text-[clamp(7rem,min(20vw,20svh),10rem)] leading-none font-medium tracking-[-0.08em]"
      >
        404
      </p>
      <h1
        id="not-found-title"
        className="text-app-ink mt-5 text-3xl leading-tight font-semibold tracking-tight md:text-5xl"
      >
        <span className="sr-only">404 — </span>
        {t.title}
      </h1>
      <p className="text-app-muted mt-4 max-w-md text-base leading-relaxed md:text-lg">
        {t.description}
      </p>
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
        <AccentButton asChild className="gap-2">
          <Link href={`/${locale}`}>
            <span aria-hidden="true">{ARROWS.left}</span>
            {t.home}
          </Link>
        </AccentButton>
        <AppLink
          href={`/${locale}#${anchors.projects}`}
          arrow="downRight"
          color="blueBright"
          fontMono
        >
          {t.projects}
        </AppLink>
      </div>
    </section>
  );
}
