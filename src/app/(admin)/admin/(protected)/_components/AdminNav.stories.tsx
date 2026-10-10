import { useEffect, useRef } from 'react';
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
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: routes.admin.media,
      },
    },
  },
  render: () => <AdminNav />,
};

export const MobileMenuOpen: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: routes.admin.project('example-project-id'),
      },
    },
  },
  render: () => <AdminNavWithOpenMobileMenu />,
};

function AdminNavWithOpenMobileMenu() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menuButton = wrapperRef.current?.querySelector<HTMLButtonElement>(
      '[aria-controls="admin-mobile-menu"]'
    );

    if (menuButton?.getAttribute('aria-expanded') === 'false') {
      menuButton.click();
    }
  }, []);

  return (
    <div ref={wrapperRef}>
      <AdminNav />
    </div>
  );
}
