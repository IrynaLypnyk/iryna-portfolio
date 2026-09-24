'use client';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  isMenuOpen: boolean;
  toggleMobileMenu: () => void;
};

export function BurgerMenuButton({ isMenuOpen, toggleMobileMenu }: Props) {
  return (
    <div className="flex w-13.5 items-center justify-end">
      <AnimatePresence initial={false}>
        {/* Burger / close menu button */}
        <div className="flex w-13.5 items-center justify-end">
          <motion.button
            data-component={
              isMenuOpen ? 'MobileNavigationCloseButton' : 'MobileNavigationOpenButton'
            }
            onClick={toggleMobileMenu}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="relative flex cursor-pointer items-center justify-center p-2"
          >
            <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>

            <div className="flex items-center justify-center" aria-hidden="true">
              <div className="relative h-6 w-9">
                <motion.span
                  className="bg-app-accent-light absolute top-0 right-0 h-0.5 rounded-full"
                  variants={{
                    closed: {
                      y: 0,
                      rotate: 0,
                      width: 36,
                    },
                    open: {
                      y: 11,
                      rotate: 45,
                      width: 32,
                    },
                  }}
                  animate={isMenuOpen ? 'open' : 'closed'}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />

                <motion.span
                  className="bg-app-accent-bright absolute top-1/2 right-0 h-0.5 rounded-full"
                  variants={{
                    closed: {
                      x: 0,
                      opacity: 1,
                      width: 24,
                    },
                    open: {
                      x: 20,
                      opacity: 0,
                      width: 24,
                    },
                  }}
                  animate={isMenuOpen ? 'open' : 'closed'}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />

                <motion.span
                  className="bg-app-accent-light absolute right-0 bottom-0 h-0.5 rounded-full"
                  variants={{
                    closed: {
                      y: 0,
                      rotate: 0,
                      width: 18,
                    },
                    open: {
                      y: -11,
                      rotate: -45,
                      width: 32,
                    },
                  }}
                  animate={isMenuOpen ? 'open' : 'closed'}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              </div>
            </div>
          </motion.button>
        </div>
      </AnimatePresence>
    </div>
  );
}
