import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { adminControlBaseClassName } from './AdminInput';
import { cn } from '@/lib/utils';

export type AdminTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(adminControlBaseClassName, 'min-h-24 py-2 focus:ring-0', className)}
      {...props}
    />
  )
);

AdminTextarea.displayName = 'AdminTextarea';
