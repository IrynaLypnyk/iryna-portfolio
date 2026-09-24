'use client';

import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type AdminButtonVariant = 'solid' | 'outline' | 'ghost' | 'icon';
type AdminButtonTone = 'default' | 'danger';
type AdminButtonSize = 'sm' | 'md';

type CommonProps = {
  variant?: AdminButtonVariant;
  tone?: AdminButtonTone;
  size?: AdminButtonSize;
  startIcon?: ReactNode;
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    external?: never;
    onClick?: never;
    onClickAction?: () => void;
  };

type AsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
    external?: boolean;
    type?: never;
    onClick?: never;
    onClickAction?: never;
  };

export type AdminButtonProps = AsButton | AsLink;

// Base layout styles — shared across all variants/sizes
const base =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 shrink-0';

const sizeStyles: Record<AdminButtonSize, string> = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
};

// Icon-only variant uses square sizing instead of px/py
const iconSizeStyles: Record<AdminButtonSize, string> = {
  md: 'h-9 w-9',
  sm: 'h-7 w-7',
};

const variantStyles: Record<AdminButtonVariant, Record<AdminButtonTone, string>> = {
  solid: {
    default: 'bg-ink text-paper hover:bg-accent',
    danger: 'bg-error text-white hover:bg-red-500 active:bg-error',
  },
  outline: {
    default:
      'border border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500 hover:text-neutral-950',
    danger: 'border border-error/50 text-error hover:bg-error/10 active:bg-error/20',
  },
  ghost: {
    default: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
    danger: 'text-error hover:bg-error/10 active:bg-error/20',
  },
  icon: {
    default: 'text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300',
    danger: 'text-error hover:bg-error/10 active:bg-error/20',
  },
};

export function AdminButton({
  variant = 'solid',
  tone = 'default',
  size = 'md',
  startIcon,
  className,
  children,
  onClickAction,
  ...rest
}: AdminButtonProps) {
  const isIcon = variant === 'icon';

  const classNames = cn(
    base,
    isIcon ? iconSizeStyles[size] : sizeStyles[size],
    variantStyles[variant][tone],
    className
  );

  const innerContent = (
    <>
      {startIcon}
      {children}
    </>
  );

  if ('href' in rest && rest.href !== undefined) {
    if (rest.external) {
      return (
        <a
          href={rest.href}
          target="_blank"
          rel="noopener noreferrer"
          className={classNames}
          onClick={onClickAction}
        >
          {innerContent}
        </a>
      );
    }

    return (
      <Link href={rest.href} className={classNames} onClick={onClickAction}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={('type' in rest && rest.type) || 'button'}
      className={classNames}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      onClick={onClickAction}
    >
      {innerContent}
    </button>
  );
}
