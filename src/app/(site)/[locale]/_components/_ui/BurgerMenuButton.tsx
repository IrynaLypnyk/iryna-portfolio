'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ActionBox } from '@/app/(site)/[locale]/_components/_ui/ActionBox';
import { cn } from '@/lib/utils';

type Props = {
  isMenuOpen: boolean;
  toggleMobileMenu: () => void;
};

const lineClassName =
  'bg-app-accent-bright group-hover:bg-app-accent-lightest absolute h-0.5 transition-colors duration-500';

export function BurgerMenuButton({ isMenuOpen, toggleMobileMenu }: Props) {
  return (
    <AnimatePresence initial={false}>
      {/* Burger / close menu button */}
      <ActionBox className={isMenuOpen ? 'bg-app-accent-bright' : ''}>
        <motion.button
          data-component={isMenuOpen ? 'MobileNavigationCloseButton' : 'MobileNavigationOpenButton'}
          onClick={toggleMobileMenu}
          type="button"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          className="group relative flex h-full w-full cursor-pointer items-center justify-center"
        >
          <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>

          <div className="flex items-center justify-center" aria-hidden="true">
            <div className="relative h-2 w-5">
              <motion.span
                className={cn(
                  lineClassName,
                  'absolute top-0 right-0 h-0.5',
                  isMenuOpen && 'bg-app-accent-lightest'
                )}
                variants={{
                  closed: {
                    x: 0,
                    y: 0,
                    rotate: 0,
                    width: 20,
                  },
                  open: {
                    x: 1,
                    y: 3,
                    rotate: 45,
                    width: 22,
                  },
                }}
                animate={isMenuOpen ? 'open' : 'closed'}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />

              <motion.span
                className={cn(
                  lineClassName,
                  'right-0 bottom-0 h-0.5',
                  isMenuOpen && 'bg-app-accent-lightest'
                )}
                variants={{
                  closed: {
                    x: 0,
                    y: 0,
                    rotate: 0,
                    width: 20,
                  },
                  open: {
                    x: 1,
                    y: -3,
                    rotate: -45,
                    width: 22,
                  },
                }}
                animate={isMenuOpen ? 'open' : 'closed'}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </div>
          </div>
        </motion.button>
      </ActionBox>
    </AnimatePresence>
  );
}
