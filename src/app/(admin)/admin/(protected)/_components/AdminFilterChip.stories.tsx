import type { Meta, StoryObj } from '@storybook/nextjs';

import { routes } from '@/constants/routes';
import { AdminFilterChip } from './AdminFilterChip';

const meta: Meta<typeof AdminFilterChip> = {
  title: 'Admin/AdminFilterChip',
  component: AdminFilterChip,
  args: {
    children: 'Усі',
    active: false,
  },
};

export default meta;
type Story = StoryObj<typeof AdminFilterChip>;

export const Button: Story = {
  args: {
    onClickAction: () => {},
  },
};

export const ButtonActive: Story = {
  name: 'Button active',
  args: {
    active: true,
    onClickAction: () => {},
  },
};

export const Link: Story = {
  args: {
    href: routes.admin.media,
    children: 'Медіа',
  },
};

export const LinkActive: Story = {
  name: 'Link active',
  args: {
    href: routes.admin.media,
    active: true,
    children: 'Використовуються',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Плани',
    onClickAction: () => {},
  },
};

export const CountLabel: Story = {
  name: 'With count',
  args: {
    href: routes.admin.media,
    active: true,
    children: (
      <>
        Усі
        <span className="ml-2 text-xs text-neutral-300">24</span>
      </>
    ),
  },
};
