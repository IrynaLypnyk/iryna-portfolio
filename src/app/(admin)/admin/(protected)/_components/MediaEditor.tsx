'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { AdminButton } from '../../_components/AdminButton';
import { PhotoUploader } from '../projects/[id]/photo-manager/PhotoUploader';
import { PhotoTable } from '../projects/[id]/photo-manager/PhotoTable';
import { ReorderGrid } from '../projects/[id]/photo-manager/ReorderGrid';
import { DeletePhotoDialog } from '../projects/[id]/photo-manager/DeletePhotoDialog';
import { AdminPhotoLightbox } from '../projects/[id]/photo-manager/AdminPhotoLightbox';
import { mediaMime, newMediaDraft, type MediaDraft } from '@/lib/media/media-draft';

export type MediaEditorProps = {
  ownerType: 'projects' | 'experiments';
  ownerId: string;
  context: 'block' | 'additional';
  items: MediaDraft[];
  onChangeAction: Dispatch<SetStateAction<MediaDraft[]>>;
  onUploadingChangeAction: (uploading: boolean) => void;
  disabled?: boolean;
};

/** Draft-only adaptation of PhotoManager. The parent owns data and all saving. */
export function MediaEditor({
  ownerType,
  ownerId,
  context,
  items,
  onChangeAction,
  onUploadingChangeAction,
  disabled = false,
}: MediaEditorProps) {
  const [reordering, setReordering] = useState(false);
  const [preview, setPreview] = useState<{ index: number; ukrainian?: boolean } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MediaDraft | null>(null);
  const previews = useMemo(
    () =>
      items.map((item) => {
        const asset = preview?.ukrainian ? (item.assetUk ?? item.asset) : item.asset;
        return {
          src: asset.imageUrl,
          mimeType: mediaMime(asset),
          width: asset.width,
          height: asset.height,
        };
      }),
    [items, preview?.ukrainian]
  );
  function patch(key: string, patch: Partial<MediaDraft>) {
    onChangeAction((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  }
  return (
    <section
      aria-label={context === 'block' ? 'ContentBlock media' : 'Additional Media'}
      className="min-w-0 space-y-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-sm border border-neutral-200 bg-white p-4">
        <div>
          <p className="text-sm font-medium">
            {context === 'block' ? 'Block media' : 'Additional Media'} · {items.length}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Images up to 25 MB · MP4 / WebM up to 100 MB. Changes apply with the main form Save.
          </p>
        </div>
        <PhotoUploader
          projectId={ownerId}
          ownerType={ownerType}
          disabled={disabled}
          onUploadingChangeAction={onUploadingChangeAction}
          onAssetUploadedAction={(asset) =>
            onChangeAction((current) => [...current, newMediaDraft(asset, crypto.randomUUID())])
          }
        />
        <AdminButton
          size="sm"
          variant="outline"
          disabled={disabled || !items.length}
          onClickAction={() => setReordering((value) => !value)}
        >
          {reordering ? 'Back to metadata' : 'Reorder'}
        </AdminButton>
      </div>
      {reordering ? (
        <ReorderGrid
          items={items}
          disabled={disabled}
          onReorderChangeAction={(ordered) =>
            onChangeAction((current) =>
              ordered.map((item) => current.find((value) => value.key === item.key) ?? item)
            )
          }
        />
      ) : (
        <PhotoTable
          items={items}
          count={items.length}
          ownerType={ownerType}
          projectId={ownerId}
          disabled={disabled}
          onUploadingChangeAction={onUploadingChangeAction}
          onPatchAction={patch}
          onDeleteAction={setPendingDelete}
          onPreviewAction={(index, ukrainian) => setPreview({ index, ukrainian })}
          onMoveAction={(key, direction) =>
            onChangeAction((current) => {
              const index = current.findIndex((item) => item.key === key);
              const next = index + direction;
              if (index < 0 || next < 0 || next >= current.length) return current;
              const copy = [...current];
              [copy[index], copy[next]] = [copy[next], copy[index]];
              return copy;
            })
          }
        />
      )}
      <AdminPhotoLightbox
        photos={previews}
        index={preview?.index ?? null}
        onCloseAction={() => setPreview(null)}
      />
      {pendingDelete && (
        <DeletePhotoDialog
          photo={{
            imageUrl: pendingDelete.asset.imageUrl,
            mimeType: mediaMime(pendingDelete.asset),
          }}
          onCancelAction={() => setPendingDelete(null)}
          onConfirmAction={() => {
            if (!disabled)
              onChangeAction((current) => current.filter((item) => item.key !== pendingDelete.key));
            setPendingDelete(null);
          }}
        />
      )}
    </section>
  );
}
