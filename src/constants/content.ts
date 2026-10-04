import { LocaleType } from '@/i18n/routing';

type PersonContent = {
  name: string;
  jobTitle: string;
  location: string;
};

export const JOB_TITLE = {
  en: 'Frontend Engineer',
  uk: 'Frontend Engineer',
} satisfies Record<LocaleType, string>;

export const PERSON_CONTENT = {
  en: {
    name: 'Iryna Lypnyk',
    jobTitle: JOB_TITLE.en,
    location: 'Tonbridge',
  },
  uk: {
    name: 'Ірина Липник',
    jobTitle: JOB_TITLE.uk,
    location: 'Тонбридж',
  },
} satisfies Record<LocaleType, PersonContent>;
