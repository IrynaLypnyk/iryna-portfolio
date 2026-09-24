import type { Meta, StoryObj } from '@storybook/nextjs';
import { SupportMark } from './SupportMark';

const meta = {
  title: 'UI/SupportMark',
  component: SupportMark,
} satisfies Meta<typeof SupportMark>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two stacked hearts in the Ukrainian flag colours, used by the footer link. */
export const Default: Story = {};
