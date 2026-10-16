'use client';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { AdminInput } from '@/app/(admin)/admin/(protected)/_components/AdminInput';
import { AdminMediaPreview } from '@/app/(admin)/admin/(protected)/_components/AdminMediaPreview';
import { mediaMime, type MediaDraft, type MediaAssetPreview } from '@/lib/media/media-draft';
import { PhotoUploader } from './PhotoUploader';
export type PhotoTableRowProps = {
  item: MediaDraft;
  index: number;
  ownerType: 'projects' | 'experiments';
  projectId: string;
  disabled: boolean;
  onUploadingChangeAction: (uploading: boolean) => void;
  onPatchAction: (key: string, patch: Partial<MediaDraft>) => void;
  onDeleteAction: (item: MediaDraft) => void;
  onPreviewAction: (index: number, ukrainian?: boolean) => void;
  onMoveAction: (key: string, direction: number) => void;
  count: number;
};
export function PhotoTableRow({
  item,
  index,
  onPatchAction,
  onDeleteAction,
  onPreviewAction,
  onMoveAction,
  count,
  ...uploadProps
}: PhotoTableRowProps) {
  function variant(asset: MediaAssetPreview | null, ukrainian: boolean) {
    const label = ukrainian ? 'Ukrainian' : 'Default / English';
    return (
      <div className="min-w-32 space-y-2">
        <p className="text-xs font-medium text-neutral-600">{label}</p>
        {asset && (
          <button
            type="button"
            aria-label={`Preview ${label} media ${index + 1}`}
            onClick={() => onPreviewAction(index, ukrainian)}
          >
            <AdminMediaPreview
              mimeType={mediaMime(asset)}
              src={asset.imageUrl}
              className="h-20 w-28"
              sizes="112px"
            />
          </button>
        )}
        <PhotoUploader
          {...uploadProps}
          multiple={false}
          label={`${asset ? 'Replace' : 'Upload'} ${label}`}
          onAssetUploadedAction={(asset) =>
            onPatchAction(item.key, ukrainian ? { assetUk: asset } : { asset })
          }
        />
        {ukrainian && asset && (
          <AdminButton
            size="sm"
            variant="ghost"
            disabled={uploadProps.disabled}
            onClickAction={() => onPatchAction(item.key, { assetUk: null })}
          >
            Remove Ukrainian variant
          </AdminButton>
        )}
      </div>
    );
  }
  return (
    <tr className="border-t border-neutral-200 align-top">
      <td className="p-3">
        <p className="mb-2 text-xs text-neutral-500">
          #{index + 1} · {item.id ? 'Existing usage' : 'New usage · not saved'}
        </p>
        {item.legacyCover && (
          <p className="mb-2 max-w-64 text-xs text-neutral-500">
            Legacy cover usage. Gallery behaviour is preserved until the cover cutover.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {variant(item.asset, false)}
          {variant(item.assetUk, true)}
        </div>
      </td>
      <td className="p-3">
        <div className="grid min-w-64 gap-2 sm:grid-cols-2">
          {(['captionUk', 'captionEn', 'descriptionUk', 'descriptionEn', 'linkUrl'] as const).map(
            (field) => {
              const label = {
                captionUk: 'Caption (UK)',
                captionEn: 'Caption (EN)',
                descriptionUk: 'Description (UK)',
                descriptionEn: 'Description (EN)',
                linkUrl: 'External link',
              }[field];
              return (
                <label key={field} className={field === 'linkUrl' ? 'sm:col-span-2' : ''}>
                  <span className="text-xs text-neutral-600">{label}</span>
                  <AdminInput
                    type={field === 'linkUrl' ? 'url' : 'text'}
                    value={item[field] ?? ''}
                    disabled={uploadProps.disabled}
                    aria-label={`${label} media ${index + 1}`}
                    onChange={(event) =>
                      onPatchAction(item.key, { [field]: event.target.value || null })
                    }
                  />
                </label>
              );
            }
          )}
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-col items-start gap-2">
          <AdminButton
            size="sm"
            variant="outline"
            disabled={uploadProps.disabled || index === 0}
            aria-label={`Move media ${index + 1} up`}
            onClickAction={() => onMoveAction(item.key, -1)}
          >
            Move up
          </AdminButton>
          <AdminButton
            size="sm"
            variant="outline"
            disabled={uploadProps.disabled || index === count - 1}
            aria-label={`Move media ${index + 1} down`}
            onClickAction={() => onMoveAction(item.key, 1)}
          >
            Move down
          </AdminButton>
          <AdminButton
            size="sm"
            variant="outline"
            tone="danger"
            className="border-red-700 text-red-700 hover:border-red-800 hover:text-red-800"
            disabled={uploadProps.disabled}
            onClickAction={() => onDeleteAction(item)}
          >
            Remove
          </AdminButton>
        </div>
      </td>
    </tr>
  );
}
