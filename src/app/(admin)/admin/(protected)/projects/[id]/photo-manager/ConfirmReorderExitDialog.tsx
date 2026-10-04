'use client';

import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { AdminDialog } from '@/app/(admin)/admin/(protected)/_components/AdminDialog';

type Props = {
  isSaving: boolean;
  onSaveAndExitAction: () => void;
  onExitWithoutSavingAction: () => void;
  onCancelAction: () => void;
};

export function ConfirmReorderExitDialog({
  isSaving,
  onSaveAndExitAction,
  onExitWithoutSavingAction,
  onCancelAction,
}: Props) {
  return (
    <AdminDialog
      title="Save new order?"
      description="You changed the photo order. Save changes before leaving?"
      onCloseAction={onCancelAction}
      closeDisabled={isSaving}
    >
      <div className="flex flex-col gap-2">
        <AdminButton
          onClickAction={onSaveAndExitAction}
          disabled={isSaving}
          className="w-full justify-center"
        >
          {isSaving ? 'Saving…' : 'Save and exit'}
        </AdminButton>
        <AdminButton
          variant="outline"
          tone="danger"
          onClickAction={onExitWithoutSavingAction}
          disabled={isSaving}
          className="w-full justify-center"
        >
          Logout without saving
        </AdminButton>
        <AdminButton
          variant="ghost"
          onClickAction={onCancelAction}
          disabled={isSaving}
          className="w-full justify-center"
        >
          Залишитись
        </AdminButton>
      </div>
    </AdminDialog>
  );
}
