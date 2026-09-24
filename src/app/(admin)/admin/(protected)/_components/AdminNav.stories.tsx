import { useEffect, useRef, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';

import { routes } from '@/constants/routes';
import { AdminNav } from './AdminNav';

const meta: Meta<typeof AdminNav> = {
  title: 'Admin/AdminNav',
  component: AdminNav,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'light' },
    layout: 'fullscreen',
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
  render: () => (
    <MobileAdminNavFrame>
      <AdminNav />
    </MobileAdminNavFrame>
  ),
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
  render: () => (
    <MobileAdminNavFrame>
      <AdminNavWithOpenMobileMenu />
    </MobileAdminNavFrame>
  ),
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

function MobileAdminNavFrame({ children }: { children: ReactNode }) {
  return (
    <div className="p-4">
      <style>{`
        .admin-nav-mobile-story [data-component="AdminNav"] > div:first-of-type {
          display: none !important;
        }

        .admin-nav-mobile-story [data-component="AdminNav"] > div:nth-of-type(2) {
          display: flex !important;
        }

        .admin-nav-mobile-story [data-component="AdminNav"] > div:nth-of-type(3) {
          display: block !important;
        }
      `}</style>

      <div className="admin-nav-mobile-story mx-auto min-h-130 w-full max-w-97.5 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-sm">
        {children}
        <main className="p-4 text-sm text-neutral-500">Mobile admin content starts here.</main>
      </div>
    </div>
  );
}
