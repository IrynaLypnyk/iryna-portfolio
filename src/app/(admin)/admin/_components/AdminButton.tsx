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
  endIcon?: ReactNode;
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
    default: 'bg-app-accent-light text-app-on-dark hover:bg-app-accent',
    danger: 'bg-app-danger text-app-on-dark hover:app-danger-dark active:bg-app-danger-dark',
  },
  outline: {
    default:
      'border border-app-accent bg-app-surface text-app-accent hover:border-app-accent-dark hover:text-app-accent-dark',
    danger:
      'border border-app-danger text-app-danger hover:border-app-danger-dark hover:text-app-danger-dark active:text-app-danger-dark',
  },
  ghost: {
    default: 'text-app-accent hover:bg-app-accent-lightest active:bg-app-accent-lightest',
    danger: 'text-app-danger hover:bg-app-danger/10 hover:text-app-danger-dark',
  },
  icon: {
    default: 'text-app-accent hover:bg-app-accent-lightest active:bg-app-accent-lightest',
    danger: 'text-app-danger hover:text-app-danger-dark hover:bg-app-danger/20',
  },
};

export function AdminButton({
  variant = 'solid',
  tone = 'default',
  size = 'md',
  startIcon,
  endIcon,
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
      {endIcon}
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
