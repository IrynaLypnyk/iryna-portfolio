import type { Preview, Decorator } from '@storybook/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import { mswLoader } from 'msw-storybook-addon/csf3';
import en from '../src/messages/en.json';
import uk from '../src/messages/uk.json';
import '../src/styles/index.css';

const messagesByLocale = { en, uk } as const;

type StorybookLocale = keyof typeof messagesByLocale;

/**
 * Wrap every story in NextIntlClientProvider so components that call
 * useTranslations() render their real copy. The locale is a toolbar global,
 * which doubles as a way to eyeball the Ukrainian layout — it is noticeably
 * longer than the English one and is where wrapping bugs show up.
 */
const withNextIntl: Decorator = (Story, context) => {
  const locale = (context.globals.locale ?? 'en') as StorybookLocale;

  return (
    <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]}>
      <Story />
    </NextIntlClientProvider>
  );
};

const preview: Preview = {
  loaders: [mswLoader()],
  decorators: [withNextIntl],
  tags: ['autodocs'],
  initialGlobals: {
    locale: 'en',
  },
  globalTypes: {
    locale: {
      description: 'Active locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'uk', title: 'Українська' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    nextjs: {
      appDirectory: true, //That makes @storybook/nextjs create the next/navigation router mocks before stories render, so ProjectDeleteButton and BlogPostDeleteButton can call useRouter() safely.
    },
    backgrounds: {
      options: {
        light: {
          name: 'Light',
          value: '#faf6ec',
        },
        white: {
          name: 'White',
          value: '#ffffff',
        },
      },
    },
    initialGlobals: {
      backgrounds: {
        value: 'light',
      },
    },
  },
};

export default preview;
