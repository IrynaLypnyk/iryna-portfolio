'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

type AdminDialogProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  onCloseAction: () => void;
  closeDisabled?: boolean;
  className?: string;
};

export function AdminDialog({
  title,
  description,
  children,
  actions,
  onCloseAction,
  closeDisabled = false,
  className,
}: AdminDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) {
          onCloseAction();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn('relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl', className)}
      >
        <button
          type="button"
          aria-label="Close"
          disabled={closeDisabled}
          onClick={onCloseAction}
          className="absolute top-3 right-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <div className="pr-8">
          <h2 className="mb-1 text-base font-semibold text-neutral-900">{title}</h2>
          {description && <p className="text-sm text-neutral-500">{description}</p>}
        </div>

        <div className={description ? 'mt-4' : 'mt-5'}>{children}</div>

        {actions && <div className="mt-4">{actions}</div>}
      </div>
    </div>
  );
}
