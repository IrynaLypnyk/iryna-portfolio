import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type CommonProps = {
  active?: boolean;
  children: ReactNode;
  className?: string;
};

type AsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'> & {
    href: string;
    onClick?: never;
    onClickAction?: never;
  };

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'onClick'> & {
    href?: never;
    onClickAction?: () => void;
  };

export type AdminFilterChipProps = AsLink | AsButton;

const baseClassName =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

function getClassName(active: boolean | undefined, className?: string) {
  return cn(
    baseClassName,
    active
      ? 'border-neutral-900 bg-neutral-900 text-white'
      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
    className
  );
}

export function AdminFilterChip({
  active,
  className,
  children,
  onClickAction,
  ...props
}: AdminFilterChipProps) {
  if ('href' in props && props.href !== undefined) {
    const { href, ...linkProps } = props;

    return (
      <Link href={href} className={getClassName(active, className)} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      className={getClassName(active, className)}
      onClick={onClickAction}
      {...props}
    >
      {children}
    </button>
  );
}
