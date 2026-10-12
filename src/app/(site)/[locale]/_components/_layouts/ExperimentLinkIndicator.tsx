'use client';

import { useLinkStatus } from 'next/link';

export function ExperimentLinkIndicator({ loadingLabel }: { loadingLabel: string }) {
  const { pending } = useLinkStatus();

  return (
    <span className="text-app-accent-bright inline-flex h-5 w-5 items-center justify-center font-sans text-[18px]">
      {pending ? (
        <span role="status">
          <span className="sr-only">{loadingLabel}</span>
          <span
            aria-hidden="true"
            className="block h-4 w-4 animate-spin rounded-full border border-current border-t-transparent motion-reduce:animate-none"
          />
        </span>
      ) : (
        <span aria-hidden="true">↗</span>
      )}
    </span>
  );
}
