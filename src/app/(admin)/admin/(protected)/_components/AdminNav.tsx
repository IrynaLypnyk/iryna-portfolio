'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, FolderKanban, Home, Images, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_URL } from '@/lib/seo/config';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import LogoutButton from './LogoutButton';
import { routes } from '@/constants/routes';
import { LogoIcon } from '@/assets/icons';

const NAV_LINKS = [
  { href: routes.admin.root, label: 'Головна', icon: Home },
  { href: routes.admin.projects, label: 'Проєкти', icon: FolderKanban },
  { href: routes.admin.media, label: 'Медіа', icon: Images },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === routes.admin.root) {
    return pathname === routes.admin.root;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeLink = NAV_LINKS.find(({ href }) => isActive(pathname, href));

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header
      className="border-app-line bg-app-surface text-app-text sticky top-0 z-20 border-b"
      data-component="AdminNav"
    >
      <div className="mx-auto hidden max-w-[1600px] items-center justify-between gap-4 px-6 py-3 lg:flex">
        {/* Left: logo + nav */}
        <div className="flex min-w-0 items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href={routes.admin.root}>
              <LogoIcon className="h-10 w-10" />
            </Link>
            <span className="flex flex-wrap items-baseline gap-1 md:gap-2.5">
              <span className="text-app-text text-[18px] leading-5 font-medium">Admin</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-5">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 py-1 text-sm font-medium transition-colors',
                  isActive(pathname, href)
                    ? 'text-app-accent font-semibold'
                    : 'hover:text-app-accent'
                )}
                aria-current={isActive(pathname, href) ? 'page' : undefined}
              >
                <Icon size={16} strokeWidth={1.75} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: open site + logout */}
        <div className="flex items-center gap-3">
          <AdminButton
            variant="ghost"
            href={SITE_URL}
            external
            startIcon={<ExternalLink size={16} strokeWidth={1.75} />}
          >
            Відкрити сайт
          </AdminButton>
          <LogoutButton />
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 lg:hidden">
        <Link
          href={routes.admin.root}
          className="flex shrink-0 items-center"
          aria-label="Admin dashboard"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <LogoIcon className="h-10 w-10" />
        </Link>
        <span className="min-w-0 truncate text-sm font-semibold text-neutral-900">
          {activeLink?.label ?? 'Admin'}
        </span>

        <button
          type="button"
          className="text-app-text hover:bg-app-accent-lightest active:bg-app-accent-lightest inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
          aria-label={
            isMobileMenuOpen ? 'Закрити меню адміністратора' : 'Відкрити меню адміністратора'
          }
          aria-controls="admin-mobile-menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          {isMobileMenuOpen ? (
            <X size={22} strokeWidth={1.75} />
          ) : (
            <Menu size={22} strokeWidth={1.75} />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div id="admin-mobile-menu" className="border-app-line border-t px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Admin navigation">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-app-accent-lightest' : 'hover:bg-app-accent-lightest'
                  )}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {label}
                </Link>
              );
            })}

            <div className="border-app-line my-2 border-t" />

            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-app-text hover:bg-app-accent-lightest flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ExternalLink size={16} strokeWidth={1.75} />
              Відкрити сайт
            </a>

            <div className="px-0.5">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
