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

const darkBg = '#2a2623'; // --color-brown-800

/**
 * Apply the correct surface class (.surface-dark / .surface-light) to the
 * story wrapper so components that rely on --surface-* CSS custom properties
 * render correctly when the background toolbar toggle is used.
 */
const withSurfaceClass: Decorator = (Story, context) => {
  const bg = context.globals?.backgrounds?.value;
  const cls = bg === darkBg ? 'surface-dark' : 'surface-light';
  return (
    <div className={cls} style={{ minHeight: '100%', padding: '1rem' }}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withNextIntl, withSurfaceClass],
  parameters: {
    nextjs: {
      appDirectory: true, //That makes @storybook/nextjs create the next/navigation router mocks before stories render, so ProjectDeleteButton and BlogPostDeleteButton can call useRouter() safely.
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: darkBg },
        { name: 'light', value: '#fafafa' }, // --color-site-white
      ],
    },
    // controls: {
    //   matchers: {
    //     color: /(background|color)$/i,
    //     date: /Date$/i,
    //   },
    // },
  },
};

export default preview;
