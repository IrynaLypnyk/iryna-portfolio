import type { Meta, StoryObj } from '@storybook/nextjs';
import { SectionHeader } from './SectionHeader';

const meta = {
  title: 'UI/SectionHeader',
  component: SectionHeader,
  args: { index: '01', title: 'Selected work' },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The title is `clamp(28px, 4.4vw, 60px)`, so long headings scale rather than wrap early. */
export const LongTitle: Story = {
  args: { index: '03', title: 'Let us build something worth maintaining' },
};
