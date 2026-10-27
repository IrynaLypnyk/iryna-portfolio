'use client';

import { MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { headerNavItems } from '@/constants/navigation';
import { NavItem } from '@/components/NavItem';

type Props = {
  activeId: string;
  variant?: 'inline' | 'mobile';
  onNavigateAction?: () => void;
};

export function SiteNav({ activeId, variant = 'inline', onNavigateAction }: Props) {
  const t = useTranslations('Navigation');

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    onNavigateAction?.();
    const section = document.getElementById(id);

    // Section exists => we're already on the homepage.
    if (!section) return;

    event.preventDefault();

    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    window.history.pushState(null, '', `#${id}`);
  };

  return (
    <div
      className={
        variant === 'mobile'
          ? 'flex flex-col gap-8'
          : 'flex items-center gap-[clamp(14px,3vw,34px)]'
      }
    >
      {headerNavItems.map((item) => {
        const isActive = activeId === item.id;

        return (
          <NavItem key={item.id} active={isActive} variant={variant}>
            <Link href={item.href} onClick={(event) => handleClick(event, item.id)}>
              {t(item.labelKey)}
            </Link>
          </NavItem>
        );
      })}
    </div>
  );
}
