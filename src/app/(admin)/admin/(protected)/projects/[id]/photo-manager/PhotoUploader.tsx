'use client';

import { useState } from 'react';
import { IMAGE_FILE_ACCEPT } from '@/lib/media/validate-image-files';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { ConfirmReorderExitDialog } from './ConfirmReorderExitDialog';
import type { PhotoRow, UploadItem, UploadStatus } from './types';
import { usePhotoUpload } from './usePhotoUpload';

type Props = {
  projectId: string;
  photoCount: number;
  onPhotoUploadedAction: (photo: PhotoRow) => void;
  // Normal mode
  onEnterReorderAction: () => void;
  // Reorder mode
  isReorderMode: boolean;
  isSavingOrder: boolean;
  hasUnsavedOrder: boolean;
  onSaveOrderAction: () => void;
  onExitReorderAction: (save: boolean) => void;
};

export function PhotoUploader({
  projectId,
  photoCount,
  onPhotoUploadedAction,
  onEnterReorderAction,
  isReorderMode,
  isSavingOrder,
  hasUnsavedOrder,
  onSaveOrderAction,
  onExitReorderAction,
}: Props) {
  const [confirmingExit, setConfirmingExit] = useState(false);

  const {
    fileInputRef,
    uploadItems,
    isUploading,
    handleFilePickerClick,
    handleFileChange,
    dismissUploadStatus,
  } = usePhotoUpload({ projectId, onPhotoUploadedAction });

  function handleExitClick() {
    if (hasUnsavedOrder) {
      setConfirmingExit(true);
    } else {
      onExitReorderAction(false);
    }
  }

  function handleExitWithSave() {
    setConfirmingExit(false);
    onExitReorderAction(true);
  }

  function handleExitWithoutSave() {
    setConfirmingExit(false);
    onExitReorderAction(false);
  }

  function handleCancelExit() {
    setConfirmingExit(false);
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm text-neutral-600">{photoCount} фото</p>

        {isReorderMode ? (
          <div className="flex flex-wrap items-center gap-2">
            {/* Reorder mode toolbar */}
            <AdminButton
              tone={hasUnsavedOrder ? 'danger' : 'default'}
              onClickAction={onSaveOrderAction}
              disabled={isSavingOrder}
            >
              {isSavingOrder ? 'Saving…' : 'Save order'}
            </AdminButton>
            <AdminButton variant="outline" onClickAction={handleExitClick} disabled={isSavingOrder}>
              ← Назад до таблиці
            </AdminButton>
          </div>
        ) : (
          /* Normal mode toolbar */
          <div className="flex flex-wrap gap-2">
            <AdminButton onClickAction={handleFilePickerClick} disabled={isUploading}>
              {isUploading ? 'Uploading…' : 'Upload photo'}
            </AdminButton>
            <AdminButton
              variant="outline"
              onClickAction={onEnterReorderAction}
              disabled={isUploading}
            >
              Reorder
            </AdminButton>
          </div>
        )}
      </div>

      {uploadItems.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700">Стан завантаження</p>

            {!isUploading && (
              <AdminButton variant="ghost" size="sm" onClickAction={dismissUploadStatus}>
                Close
              </AdminButton>
            )}
          </div>

          <ul className="space-y-1.5">
            {uploadItems.map((item) => (
              <li key={item.uid} className="flex items-center gap-2 text-sm">
                <UploadStatusDot status={item.status} />
                <span className="truncate text-neutral-700">{item.fileName}</span>
                <UploadStatusText item={item} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {confirmingExit && (
        <ConfirmReorderExitDialog
          isSaving={isSavingOrder}
          onSaveAndExitAction={handleExitWithSave}
          onExitWithoutSavingAction={handleExitWithoutSave}
          onCancelAction={handleCancelExit}
        />
      )}
    </>
  );
}

function UploadStatusDot({ status }: { status: UploadStatus }) {
  if (status === 'queued') {
    return <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-neutral-300" />;
  }

  if (status === 'uploading') {
    return (
      <span className="inline-block h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-indigo-500" />
    );
  }

  if (status === 'done') {
    return <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />;
  }

  return <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />;
}

function UploadStatusText({ item }: { item: UploadItem }) {
  if (item.status === 'queued') {
    return <span className="ml-auto flex-shrink-0 text-xs text-neutral-400">у черзі</span>;
  }

  if (item.status === 'uploading') {
    return <span className="ml-auto flex-shrink-0 text-xs text-indigo-600">завантаження…</span>;
  }

  if (item.status === 'done') {
    return <span className="ml-auto flex-shrink-0 text-xs text-green-600">готово ✓</span>;
  }

  return (
    <span className="ml-auto flex-shrink-0 text-xs text-red-600">
      {item.errorMessage ?? 'error'}
    </span>
  );
}
