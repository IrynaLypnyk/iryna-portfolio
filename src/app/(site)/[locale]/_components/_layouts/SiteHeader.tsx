'use client';
import { useTranslations } from 'next-intl';
import { SectionNav } from '@/app/(site)/[locale]/_components/_ui/SectionNav';
import { useState, useEffect } from 'react';
import { headerNavItems } from '@/constants/navigation';
import { PageContainer } from '@/app/(site)/[locale]/_components/_ui/PageContainer';
import { BurgerMenuButton } from '@/app/(site)/[locale]/_components/_ui/BurgerMenuButton';
import { LocaleSwitcher } from '@/app/(site)/[locale]/_components/_ui/LocaleSwitcher';
import { MobileMenuContainer } from '@/components/MobileMenuContainer';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/assets/icons';

export function SiteHeader() {
  const tCommon = useTranslations('Common');
  const tNav = useTranslations('Navigation');
  const [activeId, setActiveId] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <header className="border-app-line bg-app-page/70 sticky top-0 z-10 border-b backdrop-blur-sm">
        <PageContainer className="flex min-h-(--header-height) items-center justify-between gap-1 md:gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon className="h-10 w-10" />
              <span className="flex flex-wrap items-baseline gap-2">
                <span className="text-app-text text-[16px] leading-5 font-semibold tracking-[-0.01em]">
                  {tCommon('name')}
                </span>
                <span className="text-app-muted caption text-[12px] leading-5">/</span>
                <span className="text-app-muted caption text-[12px] leading-5 tracking-wide">
                  {tCommon('role')}
                </span>
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-[clamp(14px,3vw,34px)]">
            <div className="hidden md:block">
              <SectionNav activeId={activeId} />
            </div>
            <div className="md:hidden">
              <BurgerMenuButton
                isMenuOpen={isMobileMenuOpen}
                toggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
              />
            </div>
            <div className="hidden md:block">
              <LocaleSwitcher />
            </div>
          </nav>
        </PageContainer>
      </header>
      <MobileMenuContainer isMenuOpen={isMobileMenuOpen}>
        <div className="mb-auto flex flex-col gap-8 px-10 pb-10">
          {headerNavItems.map((item) => {
            const isActive = activeId === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'hover:text-app-accent text-[clamp(28px,3.8vw,52px)] leading-tight font-semibold tracking-tight transition-colors',
                  isActive ? 'text-app-accent' : 'text-app-muted'
                )}
              >
                {tNav(item.labelKey)}
              </Link>
            );
          })}
          <div className="border-app-line border-t pt-8">
            <LocaleSwitcher onLocaleChangeAction={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      </MobileMenuContainer>
    </>
  );
}
