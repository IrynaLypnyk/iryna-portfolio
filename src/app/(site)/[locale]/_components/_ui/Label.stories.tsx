import type { Meta, StoryObj } from '@storybook/nextjs';
import { Label } from './Label';

const meta = {
  title: 'UI/Label',
  component: Label,
  args: { children: 'Label' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blue: Story = {
  args: { color: 'blue' },
};

export const Compact: Story = {
  args: { variant: 'compact' },
};

export const SizeSm: Story = {
  args: { size: 'sm' },
};
