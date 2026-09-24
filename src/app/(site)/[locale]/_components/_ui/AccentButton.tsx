import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function AccentButton({ className, children, ...props }: Props) {
  return (
    <button
      data-component="AccentButton"
      {...props}
      className={cn(
        'bg-app-ink text-app-on-dark inline-flex min-h-12 cursor-pointer items-center justify-self-start px-5 py-4 text-[15px] transition-colors',
        'enabled:hover:bg-app-accent-bright disabled:bg-app-disabled disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}
