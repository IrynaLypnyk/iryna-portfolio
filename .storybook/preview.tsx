import type { Preview, Decorator } from '@storybook/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import '../src/styles/index.css';

/**
 * Wrap every story in NextIntlClientProvider so components that call
 * useTranslations() don't crash. Empty messages cause t('key') to fall
 * back to the key string, which is fine in Storybook.
 */
const withNextIntl: Decorator = (Story) => (
  <NextIntlClientProvider locale="en" messages={{}}>
    <Story />
  </NextIntlClientProvider>
);

const preview: Preview = {
  decorators: [withNextIntl],
  parameters: {
    nextjs: {
      appDirectory: true, //That makes @storybook/nextjs create the next/navigation router mocks before stories render, so ProjectDeleteButton and BlogPostDeleteButton can call useRouter() safely.
    },
  },
};

export default preview;
