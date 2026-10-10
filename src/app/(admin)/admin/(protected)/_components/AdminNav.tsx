'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { routes } from '@/constants/routes';
import { ADMIN_NAV_LINKS } from '@/app/(admin)/admin/constants';
import { Header } from '@/components/Header';
import LogoutButton from './LogoutButton';
import { OpenSiteButton } from '@/app/(admin)/admin/_components/OpenSiteButton';
import { BurgerMenuButton } from '@/app/(site)/[locale]/_components/_ui/BurgerMenuButton';
import { MobileMenuContainer } from '@/components/MobileMenuContainer';

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

  return (
    <>
      <Header
        title={
          <span className="flex flex-wrap items-baseline gap-1 md:gap-2.5">
            <span className="text-app-text text-[18px] leading-5 font-medium uppercase">Admin</span>
          </span>
        }
        nav={
          <>
            <nav className="hidden items-center gap-10 md:flex">
              {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 py-1 text-base font-medium tracking-wide transition-colors',
                    isActive(pathname, href)
                      ? 'text-app-text border-app-accent-bright/50 border-b font-semibold'
                      : 'hover:text-app-accent-bright text-app-muted'
                  )}
                  aria-current={isActive(pathname, href) ? 'page' : undefined}
                >
                  {label}
                  <Icon size={16} strokeWidth={1.5} />
                </Link>
              ))}
            </nav>
            <span className="text-app-text border-app-accent-bright/50 flex min-w-0 grow items-center justify-center gap-1 truncate border-b text-sm font-semibold uppercase md:hidden">
              {ActiveLinkIcon ? <ActiveLinkIcon size={16} strokeWidth={1} /> : null}
              {activeLink?.label ?? 'Admin'}
            </span>
            <div className="md:hidden">
              <BurgerMenuButton
                isMenuOpen={isMobileMenuOpen}
                toggleMobileMenuAction={() => setIsMobileMenuOpen((prev) => !prev)}
              />
            </div>
          </>
        }
        rightContent={
          <>
            <OpenSiteButton />
            <LogoutButton />
          </>
        }
        logoHref={routes.admin.root}
        headerClass="border-app-line bg-app-surface text-app-text sticky top-0 z-20 border-b"
      />

      {isMobileMenuOpen && (
        <MobileMenuContainer isMenuOpen={isMobileMenuOpen}>
          <nav className="flex flex-col gap-3 px-4 py-3" aria-label="Admin navigation">
            {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold tracking-wide uppercase transition-colors',
                    active ? 'text-app-accent-bright' : 'hover:bg-app-accent-lightest'
                  )}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} strokeWidth={1.5} />
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
        </MobileMenuContainer>
      )}
    </>
  );
}
