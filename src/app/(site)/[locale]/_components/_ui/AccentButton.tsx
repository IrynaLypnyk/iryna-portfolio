import type { ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };

export function AccentButton({ asChild = false, className, children, ...props }: Props) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      data-component="AccentButton"
      {...props}
      className={cn(
        'bg-app-ink text-app-on-dark inline-flex min-h-12 cursor-pointer items-center justify-self-start px-5 py-4 text-[15px] transition-colors',
        'not-disabled:hover:bg-app-accent-bright disabled:bg-app-disabled disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </Component>
  );
}
