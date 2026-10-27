import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps, ReactElement } from 'react';
import { cn } from '@/lib/utils';

type Props = Omit<ComponentProps<typeof Slot>, 'children'> & {
  active?: boolean;
  variant?: 'inline' | 'mobile';
  children: ReactElement;
};

/** Style the supplied link while preserving its routing and click behavior. */
export function NavItem({ active = false, variant = 'inline', className, ...props }: Props) {
  return (
    <Slot
      {...props}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-app-muted transition-colors',
        variant === 'inline'
          ? [
              'border-b-2 border-transparent',
              active ? 'border-app-accent-bright text-app-ink font-semibold' : 'hover:text-app-ink',
            ]
          : [
              'text-[clamp(28px,3.8vw,52px)] leading-none font-semibold tracking-tight',
              active ? 'text-app-accent-bright' : 'hover:text-app-accent-bright',
            ],
        className
      )}
    />
  );
}
