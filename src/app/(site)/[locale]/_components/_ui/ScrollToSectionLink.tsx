'use client';
import { ReactNode } from 'react';
import { type Anchor } from '@/types';

type Props = {
  anchor: Anchor;
  children: ReactNode;
};

export function ScrollToSectionLink({ anchor, children }: Props) {
  return (
    <a
      href={anchor}
      className="text-app-accent hover:text-app-link-hover tracking-label inline-flex min-h-11 w-fit items-center gap-2.5 self-start font-mono text-[13px] uppercase transition-colors"
    >
      <span aria-hidden="true">→</span> {children}
    </a>
  );
}
