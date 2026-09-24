import type { Meta, StoryObj } from '@storybook/nextjs';
import { Kicker } from './Kicker';

const meta = {
  title: 'UI/Kicker',
  component: Kicker,
  args: { children: 'Selected work' },
} satisfies Meta<typeof Kicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The hero variant: a 44px accent rule leads into the label. */
export const WithRule: Story = {
  args: { withRule: true },
};
