'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import LogoutButton from './LogoutButton';
import { routes } from '@/constants/routes';
import { LogoIcon } from '@/assets/icons';
import { OpenSiteButton } from '@/app/(admin)/admin/_components/OpenSiteButton';
import { ADMIN_NAV_LINKS } from '@/app/(admin)/admin/constants';
import { BurgerMenuButton } from '@/app/(site)/[locale]/_components/_ui/BurgerMenuButton';

function isActive(pathname: string, href: string): boolean {
  if (href === routes.admin.root) {
    return pathname === routes.admin.root;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeLink = ADMIN_NAV_LINKS.find(({ href }) => isActive(pathname, href));
  const ActiveLinkIcon = activeLink?.icon;

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
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-3">
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

          {/* Nav - desktop */}
          <nav className="hidden items-center gap-5 md:flex">
            {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => (
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
        {/* Active nav - mobile */}
        <span className="text-app-accent flex min-w-0 grow items-center justify-center gap-1 truncate text-sm font-semibold md:hidden">
          {ActiveLinkIcon ? <ActiveLinkIcon size={16} strokeWidth={1.5} /> : null}
          {activeLink?.label ?? 'Admin'}
        </span>

        {/* Right: open site + logout */}
        <div className="hidden items-center gap-3 md:flex">
          <OpenSiteButton />
          <LogoutButton />
        </div>
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 md:hidden">
          <BurgerMenuButton
            isMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={() => setIsMobileMenuOpen((current) => !current)}
          />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div id="admin-mobile-menu" className="border-app-line border-t px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3" aria-label="Admin navigation">
            {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => {
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
                  <Icon size={16} strokeWidth={1.5} />
                  {label}
                </Link>
              );
            })}

            <div className="border-app-line my-2 border-t" />
            <div className="flex min-w-0 flex-wrap items-center">
              <OpenSiteButton />
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
