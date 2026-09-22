import { headerNavItems } from '@/constants/navigation';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

type Props = {
  isMenuOpen: boolean;
  activeId: string;
  closeMobileMenu: () => void;
};

export function MobileNav({ isMenuOpen, activeId, closeMobileMenu }: Props) {
  const t = useTranslations('Navigation');

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          data-component="MobileNav"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-app-page border-app-line fixed inset-0 top-(--header-height) z-90 flex min-h-[calc(100dvh-var(--header-height))] flex-col overflow-y-auto border-t pt-(--header-height)"
        >
          <div className="mb-auto flex flex-col gap-8 px-10 pb-10">
            {headerNavItems.map((item) => {
              const isActive = activeId === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={closeMobileMenu}
                  className={cn(
                    'hover:text-app-accent text-[clamp(28px,3.8vw,52px)] leading-tight font-semibold tracking-[-0.03em] transition-colors',
                    isActive ? 'text-app-accent' : 'text-app-muted'
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
