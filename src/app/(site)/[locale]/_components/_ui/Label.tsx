import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Label({
  children,
  color = 'gray',
  variant = 'roomy',
}: {
  children: ReactNode;
  color?: 'blue' | 'gray';
  variant?: 'roomy' | 'compact';
}) {
  const isRoomy = variant === 'roomy';
  return (
    <span
      data-component="Label"
      className={cn(
        'font-mono text-[11.5px] whitespace-nowrap uppercase',
        color === 'gray' ? 'text-app-text' : 'text-app-accent-bright',
        isRoomy ? 'tracking-widest' : 'tracking-normal'
      )}
    >
      {children}
    </span>
  );
}
