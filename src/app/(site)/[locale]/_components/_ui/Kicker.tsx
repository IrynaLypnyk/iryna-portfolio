import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  as?: ElementType;
  /** Prefix the label with the design's 44px accent rule (used by the hero). */
  withRule?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * The small mono label used throughout the design — hero eyebrow, project
 * labels, `<dt>` terms, the "More work" heading.
 */
export function Kicker({ as: Tag = 'span', withRule = false, className, children }: Props) {
  const label = (
    <Tag
      data-component="Kicker"
      className={cn(
        'text-app-muted font-mono text-xs tracking-wide uppercase',
        !withRule && className
      )}
    >
      {children}
    </Tag>
  );

  if (!withRule) {
    return label;
  }

  return (
    <span className={cn('flex items-center gap-3.5', className)}>
      <span aria-hidden="true" className="bg-app-accent block h-px w-11" />
      {label}
    </span>
  );
}
