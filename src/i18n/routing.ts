import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'uk'] as const;

export type LocaleType = (typeof locales)[number];

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'uk',
});
