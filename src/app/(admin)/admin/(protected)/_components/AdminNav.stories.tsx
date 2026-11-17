import { userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs';

import { routes } from '@/constants/routes';
import { AdminNav } from './AdminNav';

const meta: Meta<typeof AdminNav> = {
  title: 'Admin/AdminNav',
  component: AdminNav,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: routes.admin.projects,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdminNav>;

export const ProjectsActive: Story = {};

export const MobileClosed: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: routes.admin.media,
      },
    },
  },
};

export const MobileMenuOpen: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: routes.admin.project('example-project-id'),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const menu = within(canvasElement).queryByRole('button', { name: 'Open menu' });
    if (menu) await userEvent.click(menu);
  },
};
