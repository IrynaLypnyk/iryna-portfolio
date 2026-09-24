'use client';

import { AdminDeleteDialog } from '@/app/(admin)/admin/(protected)/_components/AdminDeleteDialog';
import { AdminMediaPreview } from '@/app/(admin)/admin/(protected)/_components/AdminMediaPreview';
import type { EditablePhoto } from './types';

type Props = {
  photo: EditablePhoto;
  onConfirmAction: () => void;
  onCancelAction: () => void;
};

export function DeletePhotoDialog({ photo, onConfirmAction, onCancelAction }: Props) {
  return (
    <AdminDeleteDialog
      title="Видалити фото?"
      description="Якщо це фото більше ніде не використовується, файл також буде видалений з ImageKit."
      onConfirmAction={onConfirmAction}
      onCancelAction={onCancelAction}
    >
      <AdminMediaPreview src={photo.imageUrl} className="h-32 w-full" sizes="384px" />
    </AdminDeleteDialog>
  );
}
