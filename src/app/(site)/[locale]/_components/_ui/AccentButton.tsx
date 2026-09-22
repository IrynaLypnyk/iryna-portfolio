import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

/** The design's only button: solid ink that flips to accent on hover. */
export function AccentButton({ className, children, ...props }: Props) {
  return (
    <button
      data-component="AccentButton"
      {...props}
      className={cn(
        'bg-app-ink text-app-on-dark inline-flex min-h-12 cursor-pointer items-center justify-self-start px-5.5 text-[15px] transition-colors',
        'hover:bg-app-accent-bright disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {children}
    </button>
  );
}
