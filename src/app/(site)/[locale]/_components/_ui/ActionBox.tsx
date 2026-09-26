import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ActionBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-component="ActionBox"
      className={cn(
        'border-app-accent-light/40 text-app-accent-bright group-hover:bg-app-accent-bright group-hover:border-app-accent-bright group-hover:text-app-on-dark flex h-11 w-11 shrink-0 items-center justify-center border transition-colors md:justify-self-end',
        className
      )}
    >
      {children}
    </div>
  );
}
