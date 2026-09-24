import type { Meta, StoryObj } from '@storybook/nextjs';
import { ScrollToSectionLink } from './ScrollToSectionLink';
import { anchors } from '@/constants/routes';

const meta = {
  title: 'UI/ScrollToSectionLink',
  component: ScrollToSectionLink,
  args: { anchor: anchors.projects, children: 'See the work' },
} satisfies Meta<typeof ScrollToSectionLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A plain `<a href="#id">` rather than a scroll handler — smooth scrolling and
 * the `scroll-mt` offset are handled in CSS, so this keeps working without JS.
 */
export const Default: Story = {};

export const ToContact: Story = {
  args: { anchor: anchors.contact, children: 'Get in touch' },
};
