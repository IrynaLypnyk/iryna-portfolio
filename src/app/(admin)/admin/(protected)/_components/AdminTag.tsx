import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type TagColor = 'info' | 'success' | 'danger' | 'warning';

const tagBaseStyles = 'rounded-2xl px-2 py-1 text-xs';
const tagStyles = {
  info: 'text-app-accent',
  success: 'text-app-success-dark',
  danger: 'bg-app-danger-light text-app-danger',
  warning: 'bg-app-warning-light text-app-warning-dark',
};

export function AdminTag({ children, color }: { children: ReactNode; color: TagColor }) {
  return <span className={cn(tagBaseStyles, tagStyles[color])}>{children}</span>;
}
