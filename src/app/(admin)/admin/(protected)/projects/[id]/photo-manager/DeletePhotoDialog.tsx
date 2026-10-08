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
      title="Delete media?"
      description="Якщо цей медіафайл більше ніде не використовується, файл також буде видалений з ImageKit."
      onConfirmAction={onConfirmAction}
      onCancelAction={onCancelAction}
    >
      <AdminMediaPreview
        mimeType={photo.mimeType}
        src={photo.imageUrl}
        className="h-32 w-full"
        sizes="384px"
      />
    </AdminDeleteDialog>
  );
}
