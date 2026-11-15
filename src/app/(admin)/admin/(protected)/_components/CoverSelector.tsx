'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { AdminButton } from '../../_components/AdminButton';
import { PhotoUploader } from '../projects/[id]/photo-manager/PhotoUploader';
import { AdminPhotoLightbox } from '../projects/[id]/photo-manager/AdminPhotoLightbox';
import { AdminMediaPreview } from './AdminMediaPreview';
import { CoverImagePicker, type CoverCandidate } from './CoverImagePicker';

import type { MediaAssetPreview } from '@/lib/media/media-draft';
import { IMAGE_MIME_TYPES } from '@/lib/media/image-policy';
import type { OwnerMediaDraft } from '@/lib/media/owner-media-draft';

export function CoverSelector({
  detail = false,
  ownerId,
  ownerType,
  media,
  onChangeAction,
  onUploadingChangeAction,
  disabled,
}: {
  detail?: boolean;
  ownerId?: string;
  ownerType: 'projects' | 'experiments';
  media: OwnerMediaDraft;
  onChangeAction: Dispatch<SetStateAction<OwnerMediaDraft>>;
  onUploadingChangeAction: (busy: boolean) => void;
  disabled: boolean;
}) {
  const [preview, setPreview] = useState<MediaAssetPreview | null>(null);
  const [previousCovers, setPreviousCovers] = useState<CoverCandidate[]>([]);
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
  const defaultField = detail ? 'detailCoverAsset' : 'coverAsset';
  const ukrainianField = detail ? 'detailCoverAssetUk' : 'coverAssetUk';
  const title = detail ? 'Case study cover' : 'Cover';
  const candidates = [
    ...new Map(
      [
        ...previousCovers,
        { asset: media.coverAsset, label: 'Home page cover' },
        { asset: media.coverAssetUk, label: 'Home page cover (UK)' },
        { asset: media.detailCoverAsset, label: 'Case study cover' },
        { asset: media.detailCoverAssetUk, label: 'Case study cover (UK)' },
        ...[
          ...media.additionalMedia,
          ...media.contentBlocks.flatMap((block) => block.photos),
        ].flatMap((photo) => [
          { asset: photo.asset, label: photo.captionEn || photo.captionUk || 'Gallery image' },
          {
            asset: photo.assetUk,
            label: photo.captionUk || photo.captionEn || 'Gallery image (UK)',
          },
        ]),
      ]
        .filter(
          (item): item is { asset: MediaAssetPreview; label: string } =>
            !!item.asset?.mimeType && IMAGE_MIME_TYPES.includes(item.asset.mimeType)
        )
        .map((item) => [item.asset.id, item])
    ).values(),
  ];
  function select(asset: MediaAssetPreview, ukrainian: boolean) {
    if (disabled || (ukrainian && !media[defaultField])) return;
    // Keep replaced covers selectable in this draft, even before a save or
    // when the library cannot be loaded. Never add a cover to the public gallery.
    setPreviousCovers(
      candidates.map((item) => ({
        ...item,
        label: item.label.startsWith('Previously used: ')
          ? item.label
          : `Previously used: ${item.label}`,
      }))
    );
    onChangeAction((current) =>
      ukrainian && !current[defaultField]
        ? current
        : {
            ...current,
            [ukrainian ? ukrainianField : defaultField]: asset,
          }
    );
  }
  function variant(asset: MediaAssetPreview | null | undefined, ukrainian: boolean) {
    const label = `${detail ? 'case study ' : ''}${ukrainian ? 'Ukrainian cover' : 'Default cover'}`;
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
        <div>
          <CoverImagePicker
            label={label}
            selectedId={asset?.id}
            candidates={candidates}
            ownerId={ownerId}
            ownerType={ownerType}
            disabled={disabled || (ukrainian && !media[defaultField])}
            onSelectAction={(chosen) => select(chosen, ukrainian)}
          />
        </div>
        {ownerId && (
          <PhotoUploader
            projectId={ownerId}
            ownerType={ownerType}
            multiple={false}
            imagesOnly
            label={`${asset ? 'Replace' : 'Upload'} ${label}`}
            disabled={disabled || (ukrainian && !media[defaultField])}
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
                  ? { ...current, [ukrainianField]: null }
                  : { ...current, [defaultField]: null, [ukrainianField]: null }
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
      aria-label={title}
      className="space-y-4 rounded-sm border border-neutral-200 bg-white p-5"
    >
      <div>
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        <p className="mt-1 text-sm text-neutral-600">
          {detail ? 'Shown at the top of the case study page.' : 'Shown on the home page card.'}{' '}
          Choose an existing image or upload a new one. The Ukrainian variant needs a default cover.
        </p>
        {!ownerId && (
          <p className="mt-2 text-sm text-neutral-600">
            Save this new record first to upload a cover.
          </p>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {variant(media[defaultField], false)}
        {variant(media[ukrainianField], true)}
      </div>
      <AdminPhotoLightbox
        photos={previews}
        index={preview ? 0 : null}
        onCloseAction={() => setPreview(null)}
      />
    </section>
  );
}
