import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type AdminInputProps = InputHTMLAttributes<HTMLInputElement>;

export const adminControlBaseClassName =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400 hover:border-neutral-400 focus:border-neutral-700 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500';

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        adminControlBaseClassName,
        'h-10 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-700 focus:ring-0',
        className
      )}
      {...props}
    />
  )
);

AdminInput.displayName = 'AdminInput';
