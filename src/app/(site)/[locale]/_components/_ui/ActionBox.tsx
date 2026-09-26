import { ReactNode } from 'react';

export function ActionBox({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="border-app-accent-light/40 text-app-accent-bright group-hover:bg-app-accent-bright group-hover:border-app-accent-bright group-hover:text-app-on-dark flex h-11 w-11 shrink-0 items-center justify-center border transition-colors md:justify-self-end"
    >
      {children}
    </div>
  );
}
