'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PageContainer } from '@/app/(site)/[locale]/_components/_ui/PageContainer';
import { LogoIcon } from '@/assets/icons';
import { routes } from '@/constants/routes';
import { LocaleSwitcher } from '@/app/(site)/[locale]/_components/_ui/LocaleSwitcher';
import { SectionNav } from '@/app/(site)/[locale]/_components/_ui/SectionNav';
import { BurgerMenuButton } from '@/app/(site)/[locale]/_components/_ui/BurgerMenuButton';
import { MobileNav } from '@/app/(site)/[locale]/_components/_ui/MobileNav';
import { useState, useEffect } from 'react';
import { headerNavItems } from '@/constants/navigation';

export function SiteHeader() {
  const t = useTranslations('Common');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  const [activeId, setActiveId] = useState('');
  const ACTIVATION_POINT = 0.42;

  useEffect(() => {
    let frameId = 0;
    let lastScrollY = -1;

    const resolve = () => {
      let current = '';

      for (const item of headerNavItems) {
        const element = document.getElementById(item.id);

        if (
          element &&
          element.getBoundingClientRect().top <= window.innerHeight * ACTIVATION_POINT
        ) {
          current = item.id;
        }
      }

      setActiveId(current);
    };

    const tick = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

      if (scrollY !== lastScrollY) {
        lastScrollY = scrollY;
        resolve();
      }

      frameId = requestAnimationFrame(tick);
    };

    resolve();
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, []);
  return (
    <>
      <header
        data-component="SiteHeader"
        className="border-app-line bg-app-page/70 sticky top-0 z-10 border-b backdrop-blur-sm"
      >
        <PageContainer className="flex min-h-(--header-height) items-center justify-between gap-1 md:gap-6">
          <div className="flex items-center gap-3">
            <Link href={routes.home}>
              <LogoIcon className="h-10 w-10" />
            </Link>
            <span className="flex flex-wrap items-baseline gap-1 md:gap-2.5">
              <span className="text-app-text text-[18px] leading-5 font-medium">{t('name')}</span>
              <span className="text-app-muted caption leading-5">{t('role')}</span>
            </span>
          </div>

          <nav className="flex items-center gap-[clamp(14px,3vw,34px)]">
            <div className="hidden md:block">
              <SectionNav activeId={activeId} />
            </div>
            <div className="-mr-2 md:hidden">
              <BurgerMenuButton isMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
              <MobileNav
                isMenuOpen={isMobileMenuOpen}
                activeId={activeId}
                closeMobileMenu={closeMobileMenu}
              />
            </div>
            <div className="hidden md:block">
              <LocaleSwitcher />
            </div>
          </nav>
        </PageContainer>
      </header>
    </>
  );
}
