'use client';

import type { ReactNode } from 'react';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';

const TRANSITION_MS = 300;

export function MobileMenuContainer({
  isMenuOpen,
  children,
}: {
  isMenuOpen: boolean;
  children: ReactNode;
}) {
  const { mounted, visible } = usePresence(isMenuOpen, TRANSITION_MS);

  if (!mounted) return null;

  return (
    <div
      data-component="MobileMenuContainer"
      data-state={visible ? 'open' : 'closed'}
      className={cn(
        'bg-app-page border-app-line fixed inset-0 top-(--header-height) z-90 flex min-h-[calc(100dvh-var(--header-height))] flex-col overflow-y-auto border-t pt-(--header-height)',
        'transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none',
        // `translate-none` at rest so the fixed menu doesn't become a containing block for fixed children.
        visible ? 'translate-none opacity-100' : '-translate-x-[50px] opacity-0'
      )}
    >
      {children}
    </div>
  );
}
