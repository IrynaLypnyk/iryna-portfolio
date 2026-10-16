'use client';
import { PROJECT_MEDIA_ACCEPT } from '@/lib/media/project-media-policy';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import type { MediaAssetPreview } from '@/lib/media/media-draft';
import { usePhotoUpload } from './usePhotoUpload';
type Props = {
  projectId: string;
  ownerType: 'projects' | 'experiments';
  onAssetUploadedAction: (asset: MediaAssetPreview) => void;
  onUploadingChangeAction: (uploading: boolean) => void;
  disabled?: boolean;
  multiple?: boolean;
  label?: string;
};
/** One upload implementation for new usages and either localized variant. */
export function PhotoUploader({
  disabled,
  multiple = true,
  label = 'Upload photos / videos',
  ...props
}: Props) {
  const {
    fileInputRef,
    uploadItems,
    isUploading,
    handleFilePickerClick,
    handleFileChange,
    dismissUploadStatus,
  } = usePhotoUpload({ ...props, multiple });
  return (
    <div className="min-w-0 space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={PROJECT_MEDIA_ACCEPT}
        multiple={multiple}
        className="hidden"
        disabled={disabled || isUploading}
        aria-label={label}
        onChange={handleFileChange}
      />
      <AdminButton
        size="sm"
        variant="outline"
        disabled={disabled || isUploading}
        onClickAction={handleFilePickerClick}
      >
        {isUploading ? 'Uploading…' : label}
      </AdminButton>
      {uploadItems.length > 0 && (
        <div aria-live="polite" className="max-w-md text-xs">
          <ul className="space-y-1">
            {uploadItems.map((item) => (
              <li
                key={item.uid}
                className={item.status === 'error' ? 'text-red-700' : 'text-neutral-600'}
              >
                <span className="break-all">{item.fileName}</span>:{' '}
                {item.status === 'uploading'
                  ? `Uploading ${item.progress ?? 0}%`
                  : item.status === 'done'
                    ? 'Uploaded · save the form to apply'
                    : item.status === 'error'
                      ? item.errorMessage
                      : 'Queued'}
              </li>
            ))}
          </ul>
          {!isUploading && (
            <AdminButton variant="ghost" size="sm" onClickAction={dismissUploadStatus}>
              Dismiss upload status
            </AdminButton>
          )}
        </div>
      )}
    </div>
  );
}
