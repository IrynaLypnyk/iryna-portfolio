import type { Meta, StoryObj } from '@storybook/nextjs';

import { AdminInput } from './AdminInput';

const meta: Meta<typeof AdminInput> = {
  title: 'Admin/AdminInput',
  component: AdminInput,
  args: {
    placeholder: 'sample-project',
    type: 'text',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'number', 'date', 'file', 'password', 'search', 'url'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdminInput>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: 'Alter Ego',
    onChange: () => {},
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    value: 2026,
    onChange: () => {},
  },
};

export const Date: Story = {
  args: {
    type: 'date',
    value: '2026-09-16',
    onChange: () => {},
  },
};

export const File: Story = {
  args: {
    type: 'file',
    placeholder: undefined,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Не можна редагувати',
    onChange: () => {},
  },
};
