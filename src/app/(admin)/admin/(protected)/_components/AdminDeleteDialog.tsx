'use client';

import type { ReactNode } from 'react';

import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { AdminDialog } from './AdminDialog';

type AdminDeleteDialogProps = {
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  isDeleting?: boolean;
  confirmLabel?: string;
  onConfirmAction: () => void;
  onCancelAction: () => void;
};

export function AdminDeleteDialog({
  title,
  description,
  children,
  isDeleting = false,
  confirmLabel = 'Видалити',
  onConfirmAction,
  onCancelAction,
}: AdminDeleteDialogProps) {
  return (
    <AdminDialog
      title={title}
      description={description}
      onCloseAction={onCancelAction}
      closeDisabled={isDeleting}
      actions={
        <div className="flex justify-end gap-2">
          <AdminButton
            variant="ghost"
            size="sm"
            onClickAction={onCancelAction}
            disabled={isDeleting}
          >
            Скасувати
          </AdminButton>
          <AdminButton
            variant="solid"
            tone="danger"
            size="sm"
            onClickAction={onConfirmAction}
            disabled={isDeleting}
          >
            {isDeleting ? 'Видалення…' : confirmLabel}
          </AdminButton>
        </div>
      }
    >
      {children ?? null}
    </AdminDialog>
  );
}
