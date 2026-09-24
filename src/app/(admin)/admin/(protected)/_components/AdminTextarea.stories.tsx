import type { Meta, StoryObj } from '@storybook/nextjs';

import { AdminTextarea } from './AdminTextarea';

const meta: Meta<typeof AdminTextarea> = {
  title: 'Admin/AdminTextarea',
  component: AdminTextarea,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'light' },
  },
  args: {
    placeholder: 'Опис проєкту',
    rows: 4,
  },
};

export default meta;
type Story = StoryObj<typeof AdminTextarea>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: 'Світлий інтерʼєр із мʼякими акцентами та функціональним плануванням.',
    onChange: () => {},
  },
};

export const Compact: Story = {
  args: {
    rows: 2,
    placeholder: 'Короткий підпис',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Не можна редагувати',
    onChange: () => {},
  },
};
