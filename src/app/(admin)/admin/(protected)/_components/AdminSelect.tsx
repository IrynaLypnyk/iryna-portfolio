import { forwardRef, type SelectHTMLAttributes } from 'react';

import { adminControlBaseClassName } from './AdminInput';
import { cn } from '@/lib/utils';

export type AdminSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const chevronBackground =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23171717' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ className, style, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        adminControlBaseClassName,
        'h-10 appearance-none pr-12 focus:ring-0',
        className
      )}
      style={{
        backgroundImage: chevronBackground,
        backgroundPosition: 'right 1rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '16px 16px',
        ...style,
      }}
      {...props}
    />
  )
);

AdminSelect.displayName = 'AdminSelect';
