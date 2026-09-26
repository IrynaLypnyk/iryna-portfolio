import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Label({
  children,
  color = 'gray',
}: {
  children: ReactNode;
  color?: 'blue' | 'gray';
}) {
  return (
    <span
      data-component="Label"
      className={cn(
        'font-mono text-[11.5px] tracking-widest uppercase',
        color === 'gray' ? 'text-app-text' : 'text-app-accent-bright'
      )}
    >
      {children}
    </span>
  );
}
