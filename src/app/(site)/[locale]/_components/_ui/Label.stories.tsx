import type { Meta, StoryObj } from '@storybook/nextjs';
import { Label } from './Label';

const meta = {
  title: 'UI/Label',
  component: Label,
  args: { children: 'Label' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gray: Story = {};

export const Blue: Story = {
  args: { color: 'blue' },
};
