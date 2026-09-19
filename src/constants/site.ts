import { LocaleType } from '@/i18n/routing';
import { JOB_TITLE } from '@/constants/content';

type SiteContent = {
  siteName: string;
  siteDescription: string;
};

export const SITE_CONTENT = {
  en: {
    siteName: 'Iryna Lypnyk',
    siteDescription: `${JOB_TITLE.en} portfolio featuring selected projects, case studies and experience with React, TypeScript and Next.js.`,
  },
  uk: {
    siteName: 'Ірина Липник',
    siteDescription: `Портфоліо ${JOB_TITLE.uk} Ірини Липник: вибрані проєкти, кейси та досвід роботи з React, TypeScript і Next.js.`,
  },
} satisfies Record<LocaleType, SiteContent>;