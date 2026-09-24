import type { Meta, StoryObj } from '@storybook/nextjs';
import { LocaleSwitcher } from './LocaleSwitcher';

const meta = {
  title: 'UI/LocaleSwitcher',
  component: LocaleSwitcher,
} satisfies Meta<typeof LocaleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Boxed: Story = {
  args: { variant: 'boxed' },
};

export const Underlined: Story = {
  args: { variant: 'underlined' },
};
