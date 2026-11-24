'use client';

import type { ReactNode } from 'react';
import { useLinkStatus } from 'next/link';

/**
 * Swaps a link's icon for a small spinner while the navigation it started is pending, so a click
 * never looks ignored. Must be rendered inside a `<Link>`. The spinner fades in after a short delay
 * (see `.link-pending` in `_global.css`), so prefetched pages that open instantly don't flash it.
 */
export function LinkPending({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();

  if (!pending) return children;

  return (
    <span
      aria-hidden="true"
      className="link-pending inline-flex h-4 w-4 items-center justify-center"
    >
      <span className="block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent motion-reduce:animate-none" />
    </span>
  );
}
