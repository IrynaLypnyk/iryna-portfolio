'use client';

import type { ReactNode } from 'react';
import { usePresence } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  /** Transition duration in ms (height + opacity). */
  duration?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Animates height between 0 and auto with the CSS grid `0fr → 1fr` technique.
 * Content is mounted only while open (or while closing), matching the previous AnimatePresence behaviour.
 */
export function Collapse({ open, duration = 250, className, children }: Props) {
  const { mounted, visible } = usePresence(open, duration);

  if (!mounted) return null;

  return (
    <div
      data-state={visible ? 'open' : 'closed'}
      style={{ transitionDuration: `${duration}ms` }}
      className={cn(
        'grid transition-[grid-template-rows,opacity] ease-out motion-reduce:transition-none',
        visible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        className
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
