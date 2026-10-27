'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/components/NavItem';
import { routes } from '@/constants/routes';
import { ADMIN_NAV_LINKS } from '@/app/(admin)/admin/constants';
import { AdminHeader } from '@/app/(admin)/admin/_components/AdminHeader';
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

  return (
    <>
      <AdminHeader
        title={
          <span className="flex flex-wrap items-baseline gap-1 md:gap-2.5">
            <span className="text-app-text text-[18px] leading-5 font-medium uppercase">Admin</span>
          </span>
        }
        nav={
          <>
            <nav className="hidden items-center gap-10 md:flex">
              {ADMIN_NAV_LINKS.map(({ href, label }) => (
                <NavItem key={href} active={isActive(pathname, href)}>
                  <Link href={href}>{label}</Link>
                </NavItem>
              ))}
            </nav>
            <span className="text-app-text border-app-accent-bright flex min-w-0 grow items-center justify-center gap-1 truncate border-b-2 text-sm font-semibold uppercase md:hidden">
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
          <nav className="flex flex-col gap-8 px-10 pb-10" aria-label="Admin navigation">
            {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);

              return (
                <NavItem
                  key={href}
                  active={active}
                  variant="mobile"
                  className="flex items-center gap-2"
                >
                  <Link href={href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Icon size={20} strokeWidth={1.5} className="shrink-0" />
                    {label}
                  </Link>
                </NavItem>
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
