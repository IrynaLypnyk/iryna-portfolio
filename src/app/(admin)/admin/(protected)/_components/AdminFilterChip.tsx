import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';

type CommonProps = {
  active?: boolean;
  children: ReactNode;
  className?: string;
};

type AsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'type' | 'onClick'> & {
    href: string;
    onClickAction?: never;
  };

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'onClick'> & {
    href?: never;
    onClickAction?: () => void;
  };

export type AdminFilterChipProps = AsLink | AsButton;

export function AdminFilterChip({
  active,
  className,
  children,
  onClickAction,
  ...props
}: AdminFilterChipProps) {
  const variant = active ? 'solid' : 'outline';
  if ('href' in props && props.href !== undefined) {
    const { href, ...linkProps } = props;

    return (
      <AdminButton href={href} variant={variant} {...linkProps}>
        {children}
      </AdminButton>
    );
  }

  return (
    <AdminButton
      type={props.type ?? 'button'}
      variant={variant}
      onClickAction={onClickAction}
      {...props}
    >
      {children}
    </AdminButton>
  );
}
