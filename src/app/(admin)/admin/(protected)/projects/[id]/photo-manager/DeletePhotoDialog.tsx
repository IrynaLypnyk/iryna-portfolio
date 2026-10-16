'use client';

import { AdminDeleteDialog } from '@/app/(admin)/admin/(protected)/_components/AdminDeleteDialog';
import { AdminMediaPreview } from '@/app/(admin)/admin/(protected)/_components/AdminMediaPreview';

type Props = {
  photo: { imageUrl: string; mimeType?: string | null };
  onConfirmAction: () => void;
  onCancelAction: () => void;
};

export function DeletePhotoDialog({ photo, onConfirmAction, onCancelAction }: Props) {
  return (
    <AdminDeleteDialog
      title="Remove media from this collection?"
      description="Removal applies when you save the main form. A file still used by another media usage or a cover will be kept."
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
