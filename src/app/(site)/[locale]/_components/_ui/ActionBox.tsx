import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ActionBox({
  children,
  className,
  colorMode = 'onLight',
}: {
  children: ReactNode;
  className?: string;
  colorMode?: 'onDark' | 'onLight';
}) {
  return (
    <div
      aria-hidden="true"
      data-component="ActionBox"
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center border transition-colors duration-500 md:justify-self-end',
        colorMode === 'onDark'
          ? 'border-app-accent-light text-app-on-dark hover:bg-app-page hover:border-app-on-dark hover:text-app-accent-bright'
          : 'border-app-accent-light/40 text-app-accent-bright hover:bg-app-accent-bright hover:border-app-accent-bright hover:text-app-on-dark',
        className
      )}
    >
      {children}
    </div>
  );
}
