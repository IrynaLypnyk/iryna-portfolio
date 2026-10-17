'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { AdminButton } from '../../_components/AdminButton';
import { PhotoUploader } from '../projects/[id]/photo-manager/PhotoUploader';
import { AdminPhotoLightbox } from '../projects/[id]/photo-manager/AdminPhotoLightbox';
import { AdminMediaPreview } from './AdminMediaPreview';

import type { MediaAssetPreview } from '@/lib/media/media-draft';
import type { OwnerMediaDraft } from '@/lib/media/owner-media-draft';

export function CoverSelector({
  ownerId,
  ownerType,
  media,
  onChangeAction,
  onUploadingChangeAction,
  disabled,
}: {
  ownerId?: string;
  ownerType: 'projects' | 'experiments';
  media: OwnerMediaDraft;
  onChangeAction: Dispatch<SetStateAction<OwnerMediaDraft>>;
  onUploadingChangeAction: (busy: boolean) => void;
  disabled: boolean;
}) {
  const [preview, setPreview] = useState<MediaAssetPreview | null>(null);
  const previews = useMemo(
    () =>
      preview
        ? [
            {
              src: preview.imageUrl,
              mimeType: preview.mimeType,
              width: preview.width,
              height: preview.height,
            },
          ]
        : [],
    [preview]
  );
  function select(asset: MediaAssetPreview, ukrainian: boolean) {
    onChangeAction((current) =>
      ukrainian
        ? current.coverAsset
          ? { ...current, coverAssetUk: asset }
          : current
        : { ...current, coverAsset: asset }
    );
  }
  function variant(asset: MediaAssetPreview | null | undefined, ukrainian: boolean) {
    const label = ukrainian ? 'Ukrainian cover' : 'Default cover';
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium">{label} (optional)</h3>
        {asset && (
          <button type="button" onClick={() => setPreview(asset)} aria-label={`Preview ${label}`}>
            <AdminMediaPreview
              src={asset.imageUrl}
              mimeType={asset.mimeType}
              className="h-32 w-48"
              sizes="192px"
              fit="contain"
            />
          </button>
        )}
        {ownerId && (
          <PhotoUploader
            projectId={ownerId}
            ownerType={ownerType}
            multiple={false}
            imagesOnly
            label={`${asset ? 'Replace' : 'Upload'} ${label}`}
            disabled={disabled || (ukrainian && !media.coverAsset)}
            onUploadingChangeAction={onUploadingChangeAction}
            onAssetUploadedAction={(asset) => select(asset, ukrainian)}
          />
        )}
        {asset && (
          <AdminButton
            variant="outline"
            size="sm"
            disabled={disabled}
            onClickAction={() =>
              onChangeAction((current) =>
                ukrainian
                  ? { ...current, coverAssetUk: null }
                  : { ...current, coverAsset: null, coverAssetUk: null }
              )
            }
          >
            {ukrainian ? 'Remove Ukrainian cover' : 'Remove cover and its Ukrainian variant'}
          </AdminButton>
        )}
      </div>
    );
  }
  return (
    <section
      aria-label="Cover"
      className="space-y-4 rounded-sm border border-neutral-200 bg-white p-5"
    >
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Cover</h2>
        <p className="mt-1 text-sm text-neutral-600">
          An image independent of blocks and Additional Media. The Ukrainian variant needs a default
          cover.
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Current public covers remain unchanged until the new CMS pages are enabled.
        </p>
        {!ownerId && (
          <p className="mt-2 text-sm text-neutral-600">
            Save this new record first to upload a cover.
          </p>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {variant(media.coverAsset, false)}
        {variant(media.coverAssetUk, true)}
      </div>
      <AdminPhotoLightbox
        photos={previews}
        index={preview ? 0 : null}
        onCloseAction={() => setPreview(null)}
      />
    </section>
  );
}
