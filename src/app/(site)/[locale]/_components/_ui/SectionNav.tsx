'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { headerNavItems } from '@/constants/navigation';
import { cn } from '@/lib/utils';

export function SectionNav({ activeId }: { activeId: string }) {
  const t = useTranslations('Navigation');

  return (
    <div className="flex items-center gap-[clamp(14px,3vw,34px)]">
      {headerNavItems.map((item) => {
        const isActive = activeId === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'text-app-muted transition-colors',
              isActive
                ? 'border-app-accent text-app-ink border-b font-semibold'
                : 'text-app-muted hover:text-app-ink border-transparent'
            )}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}
