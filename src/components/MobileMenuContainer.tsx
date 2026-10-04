import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function MobileMenuContainer({
  isMenuOpen,
  children,
}: {
  isMenuOpen: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          data-component="MobileMenuContainer"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-app-page border-app-line fixed inset-0 top-(--header-height) z-90 flex min-h-[calc(100dvh-var(--header-height))] flex-col overflow-y-auto border-t pt-(--header-height)"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
