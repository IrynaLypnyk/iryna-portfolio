import type { Meta, StoryObj } from '@storybook/nextjs';

import { AdminTag } from './AdminTag';

const meta: Meta<typeof AdminTag> = {
  title: 'Admin/AdminTag',
  component: AdminTag,
  args: {
    children: 'Some text',
  },
  argTypes: {
    color: { control: 'inline-radio' },
  },
};

export default meta;
type Story = StoryObj<typeof AdminTag>;

export const Info: Story = {
  args: {
    color: 'info',
  },
};

export const Success: Story = {
  args: {
    color: 'success',
  },
};

export const Danger: Story = {
  args: {
    color: 'danger',
  },
};

export const Warning: Story = {
  args: {
    color: 'warning',
  },
};
