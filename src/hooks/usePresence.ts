'use client';

import { useEffect, useState } from 'react';

/**
 * Lightweight replacement for framer-motion's AnimatePresence.
 *
 * - `mounted` is true while `open`, and stays true while the exit transition runs (`exitDurationMs`).
 * - `visible` turns true right after the closed state has been rendered, so CSS transitions start from the closed state,
 *   and turns false immediately on close, so the exit transition plays before unmounting.
 *
 * Content that is open on first render is shown without an enter animation (like `initial={false}`).
 * Both flags are derived from `open` plus one state that only changes asynchronously, so a toggle
 * can never be "lost" between renders.
 */
export function usePresence(open: boolean, exitDurationMs: number) {
  // Lags behind `open`: catches up after the enter frames or after the exit transition.
  const [settled, setSettled] = useState(open);

  useEffect(() => {
    if (open) {
      // Flush styles so the browser registers the closed state, then open on the next task.
      // (A timer instead of requestAnimationFrame keeps working in tabs that don't render frames.)
      void document.body.offsetHeight;
      const timeout = window.setTimeout(() => setSettled(true), 0);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => setSettled(false), exitDurationMs);
    return () => window.clearTimeout(timeout);
  }, [open, exitDurationMs]);

  return {
    mounted: open || settled,
    visible: open && settled,
  };
}
