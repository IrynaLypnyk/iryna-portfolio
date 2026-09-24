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
      title="Зберегти новий порядок?"
      description="Ви змінили порядок фото. Зберегти зміни перед виходом?"
      onCloseAction={onCancelAction}
      closeDisabled={isSaving}
    >
      <div className="flex flex-col gap-2">
        <AdminButton
          onClickAction={onSaveAndExitAction}
          disabled={isSaving}
          className="w-full justify-center"
        >
          {isSaving ? 'Збереження…' : 'Зберегти і вийти'}
        </AdminButton>
        <AdminButton
          variant="outline"
          tone="danger"
          onClickAction={onExitWithoutSavingAction}
          disabled={isSaving}
          className="w-full justify-center"
        >
          Вийти без збереження
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
