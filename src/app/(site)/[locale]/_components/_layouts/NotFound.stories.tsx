import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotFoundContent } from '@/components/NotFoundContent';
import { PageContainer } from '../_ui/PageContainer';
import { GrowingThread } from '../_ui/GrowingThread';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { anchors } from '@/constants/routes';

const meta = {
  title: 'Layouts/NotFound',
  component: NotFoundContent,
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/en/does-not-exist' } },
  },
  argTypes: { locale: { control: false } },
  render: (args, { globals }) => (
    <div className="bg-app-page text-app-text flex min-h-dvh flex-col font-sans">
      <SiteHeader />
      <GrowingThread className="hidden md:block" />
      <PageContainer as="main" id={anchors.top} className="flex flex-1">
        <NotFoundContent {...args} locale={globals.locale === 'uk' ? 'uk' : 'en'} />
      </PageContainer>
      <SiteFooter />
    </div>
  ),
} satisfies Meta<typeof NotFoundContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Ukrainian: Story = {
  globals: { locale: 'uk' },
  parameters: { nextjs: { navigation: { pathname: '/uk/does-not-exist' } } },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
