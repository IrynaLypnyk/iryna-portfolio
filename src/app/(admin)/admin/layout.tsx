import { sans } from '@/fonts';

export const dynamic = 'force-dynamic';

import '@/styles/index.css';
import type { Metadata, Viewport } from 'next';
import React from 'react';
import { SITE_CONTENT } from '@/constants/site';
import { Toaster } from '@/app/(admin)/admin/_components/Toaster';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

const { siteName } = SITE_CONTENT.uk;

// Admin panel must never be indexed, regardless of the public site's launch/index state.
export const metadata: Metadata = {
  title: `Admin Panel | ${siteName}`,
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/favicon/site.webmanifest',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type Props = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return (
    <html lang="uk" suppressHydrationWarning className={sans.variable}>
      <body className="text-app-text bg-app-page flex min-h-screen flex-col font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
