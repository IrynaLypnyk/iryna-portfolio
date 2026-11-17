import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/NotFoundContent';
import { sans, mono } from '@/fonts';
import '@/styles/index.css';

export const metadata: Metadata = {
  title: '404 — Page not found | Iryna Lypnyk',
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-app-page text-app-text font-sans antialiased">
        <main className="mx-auto flex min-h-dvh max-w-(--page-max) items-center justify-center px-6">
          <NotFoundContent />
        </main>
      </body>
    </html>
  );
}
