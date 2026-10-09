import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Label({
  children,
  color = 'gray',
  variant = 'roomy',
  size = 'xs',
}: {
  children: ReactNode;
  color?: 'blue' | 'gray';
  variant?: 'roomy' | 'compact';
  size?: 'xs' | 'sm';
}) {
  const isRoomy = variant === 'roomy';
  return (
    <span
      data-component="Label"
      className={cn(
        'font-mono whitespace-nowrap uppercase',
        color === 'gray' ? 'text-app-muted' : 'text-app-accent-bright-text',
        isRoomy ? 'tracking-widest' : 'tracking-wide',
        size === 'xs' ? 'text-xs' : 'text-sm'
      )}
    >
      {children}
    </span>
  );
}
