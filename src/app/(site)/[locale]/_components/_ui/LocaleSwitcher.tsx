'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type LocaleType } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LABELS: Record<LocaleType, string> = { en: 'EN', uk: 'УК' };

type Props = {
  variant?: 'boxed' | 'underlined';
  onLocaleChangeAction?: () => void;
};

export function LocaleSwitcher({ variant = 'boxed', onLocaleChangeAction }: Props) {
  const locale = useLocale() as LocaleType;
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: LocaleType) {
    if (next === locale) {
      return;
    }

    const hash = window.location.hash;

    router.replace(`${pathname}${hash}`, {
      locale: next,
    });
    onLocaleChangeAction?.();
  }

  const isFooter = variant === 'underlined';

  return (
    <div
      data-component="LocaleSwitcher"
      className={cn(
        'inline-flex items-center',
        isFooter
          ? 'gap-2.5 font-mono text-[11.5px]'
          : 'border-app-line min-h-8.5 gap-0.5 border p-0.5'
      )}
    >
      {locales.map((candidate, index) => {
        const isActive = candidate === locale;

        return (
          <div key={candidate} className="contents">
            {isFooter && index > 0 && <span className="text-line">/</span>}
            <button
              type="button"
              onClick={() => switchTo(candidate)}
              aria-current={isActive ? 'true' : undefined}
              disabled={isActive}
              className={cn(
                'transition-colors',
                isActive ? 'cursor-default' : 'cursor-pointer',
                isFooter
                  ? cn(
                      'border-b pb-0.5 tracking-wide',
                      isActive
                        ? 'border-app-accent text-app-ink font-medium'
                        : 'text-app-muted hover:text-app-ink border-transparent'
                    )
                  : cn(
                      'px-2.5 py-1.5 font-mono text-xs tracking-wide',
                      isActive
                        ? 'bg-app-ink text-app-on-dark'
                        : 'text-app-muted hover:text-app-on-dark hover:bg-app-accent-bright'
                    )
              )}
            >
              {LABELS[candidate]}
            </button>
          </div>
        );
      })}
    </div>
  );
}
