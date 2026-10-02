import type { Meta, StoryObj } from '@storybook/nextjs';

import { AdminMediaPreview } from './AdminMediaPreview';

const meta: Meta<typeof AdminMediaPreview> = {
  title: 'Admin/AdminMediaPreview',
  component: AdminMediaPreview,
  args: {
    src: '/storybook/logo.png',
    alt: '',
    className: 'h-24 w-32',
    sizes: '128px',
    fit: 'cover',
  },
  argTypes: {
    fit: {
      control: 'radio',
      options: ['cover', 'contain'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdminMediaPreview>;

export const Default: Story = {};

export const Square: Story = {
  args: {
    className: 'h-24 w-24',
    sizes: '96px',
  },
};

export const Contain: Story = {
  args: {
    fit: 'contain',
    className: 'h-32 w-48',
    sizes: '192px',
  },
};

export const Wide: Story = {
  args: {
    className: 'h-28 w-64',
    sizes: '256px',
  },
};
