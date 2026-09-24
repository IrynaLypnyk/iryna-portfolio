import type { Meta, StoryObj } from '@storybook/nextjs';
import { SiteFooter } from './SiteFooter';

const meta = {
  title: 'Layouts/SiteFooter',
  component: SiteFooter,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two outbound links, the copyright line, and the underlined locale switcher. */
export const Default: Story = {};

/** The two-column top row collapses to one below `sm`. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
