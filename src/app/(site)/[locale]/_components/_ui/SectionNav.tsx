'use client';

import { MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { headerNavItems } from '@/constants/navigation';
import { cn } from '@/lib/utils';

export function SectionNav({ activeId }: { activeId: string }) {
  const t = useTranslations('Navigation');

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
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
    <div className="flex items-center gap-[clamp(14px,3vw,34px)]">
      {headerNavItems.map((item) => {
        const isActive = activeId === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={(event) => handleClick(event, item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'text-app-muted border-b border-transparent transition-colors',
              isActive
                ? 'border-app-accent-bright text-app-ink font-semibold'
                : 'hover:text-app-ink'
            )}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}
