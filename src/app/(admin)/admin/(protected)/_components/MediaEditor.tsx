'use client';

import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUp, ArrowDown, Eye, Pencil, Trash2, X } from 'lucide-react';
import { AdminButton } from '../../_components/AdminButton';
import { AdminInput } from './AdminInput';
import { AdminTextarea } from './AdminTextarea';
import { AdminMediaPreview } from './AdminMediaPreview';
import { PhotoUploader } from '../projects/[id]/photo-manager/PhotoUploader';
import { DeletePhotoDialog } from '../projects/[id]/photo-manager/DeletePhotoDialog';
import { AdminPhotoLightbox } from '../projects/[id]/photo-manager/AdminPhotoLightbox';
import { mediaMime, newMediaDraft, type MediaDraft } from '@/lib/media/media-draft';

export type MediaEditorProps = {
  ownerType: 'projects' | 'experiments';
  ownerId?: string;
  context: 'block' | 'additional';
  items: MediaDraft[];
  onChangeAction: Dispatch<SetStateAction<MediaDraft[]>>;
  onUploadingChangeAction: (uploading: boolean) => void;
  disabled?: boolean;
};

/** Controlled usage editor: every edit belongs to the parent's single form save. */
export function MediaEditor({
  ownerType,
  ownerId,
  context,
  items,
  onChangeAction,
  onUploadingChangeAction,
  disabled = false,
}: MediaEditorProps) {
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MediaDraft | null>(null);
  const item = items.find((value) => value.key === editing);
  const previews = useMemo(
    () =>
      items.map(({ asset }) => ({
        src: asset.imageUrl,
        mimeType: mediaMime(asset),
        width: asset.width,
        height: asset.height,
      })),
    [items]
  );
  function patch(key: string, patch: Partial<MediaDraft>) {
    onChangeAction((current) =>
      current.map((value) => (value.key === key ? { ...value, ...patch } : value))
    );
  }
  function move(key: string, direction: number) {
    onChangeAction((current) => {
      const index = current.findIndex((value) => value.key === key);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }
  const uploadProps = {
    projectId: ownerId ?? '',
    ownerType,
    disabled: disabled || !ownerId,
    onUploadingChangeAction,
  };
  return (
    <section
      aria-label={context === 'block' ? 'ContentBlock media' : 'Additional Media'}
      className="min-w-0 space-y-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-800">
          {context === 'block' ? 'Block media' : 'Additional Media'}{' '}
          <span className="font-normal text-neutral-500">({items.length})</span>
        </h3>
        {ownerId ? (
          <PhotoUploader
            {...uploadProps}
            onAssetUploadedAction={(asset) =>
              onChangeAction((current) => [...current, newMediaDraft(asset, crypto.randomUUID())])
            }
          />
        ) : (
          <p className="text-sm text-neutral-500">Save this new record first to upload media.</p>
        )}
      </div>
      {!!items.length && (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {items.map((value, index) => (
            <li
              key={value.key}
              className="min-w-0 overflow-hidden rounded-sm border border-neutral-200 bg-white"
            >
              <button
                type="button"
                aria-label={`Edit media ${index + 1}`}
                data-media-return={value.key}
                onClick={(event) => {
                  returnFocus.current = event.currentTarget;
                  setEditing(value.key);
                }}
                className="block w-full focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <AdminMediaPreview
                  src={value.asset.imageUrl}
                  mimeType={mediaMime(value.asset)}
                  className="aspect-[4/3] w-full"
                  sizes="240px"
                  fit="contain"
                />
              </button>
              <div className="space-y-2 p-2">
                <p className="truncate text-xs text-neutral-500">
                  {index + 1}. {value.id ? 'Saved usage' : 'New · not saved'}
                  {value.assetUk && ' · UK variant'}
                </p>
                {value.captionEn && (
                  <p className="truncate text-sm text-neutral-700">{value.captionEn}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  <AdminButton
                    variant="icon"
                    size="sm"
                    aria-label={`Preview media ${index + 1}`}
                    title={`Preview media ${index + 1}`}
                    onClickAction={() => setPreview(index)}
                  >
                    <Eye size={15} />
                  </AdminButton>
                  <AdminButton
                    variant="icon"
                    size="sm"
                    aria-label={`Edit details media ${index + 1}`}
                    title={`Edit details media ${index + 1}`}
                    onClickAction={() => {
                      returnFocus.current = document.querySelector<HTMLButtonElement>(
                        `[data-media-return="${value.key}"]`
                      );
                      setEditing(value.key);
                    }}
                  >
                    <Pencil size={15} />
                  </AdminButton>
                  <AdminButton
                    variant="icon"
                    size="sm"
                    aria-label={`Move media ${index + 1} up`}
                    title={`Move media ${index + 1} up`}
                    disabled={disabled || index === 0}
                    onClickAction={() => move(value.key, -1)}
                  >
                    <ArrowUp size={15} />
                  </AdminButton>
                  <AdminButton
                    variant="icon"
                    size="sm"
                    aria-label={`Move media ${index + 1} down`}
                    title={`Move media ${index + 1} down`}
                    disabled={disabled || index === items.length - 1}
                    onClickAction={() => move(value.key, 1)}
                  >
                    <ArrowDown size={15} />
                  </AdminButton>
                  <AdminButton
                    variant="icon"
                    size="sm"
                    tone="danger"
                    aria-label={`Remove media ${index + 1}`}
                    title={`Remove media ${index + 1}`}
                    disabled={disabled}
                    onClickAction={() => setPendingDelete(value)}
                  >
                    <Trash2 size={15} />
                  </AdminButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog.Root
        open={!!item}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        {/* Kept inside the form DOM so native validation includes open drawer controls. */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-neutral-200 bg-white p-4 shadow-xl sm:p-6"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold">Media details</Dialog.Title>
            <Dialog.Close
              aria-label="Close media details"
              className="rounded-sm p-2 hover:bg-neutral-100"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-4 text-sm text-neutral-500">
            Changes apply with the main form Save.
          </Dialog.Description>
          {item && (
            <div className="space-y-5">
              <AdminMediaPreview
                src={item.asset.imageUrl}
                mimeType={mediaMime(item.asset)}
                className="aspect-video w-full"
                sizes="640px"
                fit="contain"
                controls
              />
              <PhotoUploader
                {...uploadProps}
                multiple={false}
                label="Replace Default / English"
                onAssetUploadedAction={(asset) => patch(item.key, { asset })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  ['captionEn', 'captionUk', 'descriptionEn', 'descriptionUk', 'linkUrl'] as const
                ).map((field) => {
                  const label = {
                    captionEn: 'Caption (EN)',
                    captionUk: 'Caption (UK)',
                    descriptionEn: 'Description (EN)',
                    descriptionUk: 'Description (UK)',
                    linkUrl: 'External link',
                  }[field];
                  const props = {
                    value: item[field] ?? '',
                    disabled,
                    'aria-label': label,
                    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      patch(item.key, { [field]: event.target.value || null }),
                  };
                  return (
                    <label key={field} className={field === 'linkUrl' ? 'sm:col-span-2' : ''}>
                      <span className="mb-1 block text-xs font-medium text-neutral-600">
                        {label}
                      </span>
                      {field.startsWith('description') ? (
                        <AdminTextarea {...props} rows={3} />
                      ) : (
                        <AdminInput {...props} type={field === 'linkUrl' ? 'url' : 'text'} />
                      )}
                    </label>
                  );
                })}
              </div>
              <section
                className="space-y-3 border-t border-neutral-200 pt-4"
                aria-label="Ukrainian variant"
              >
                <h4 className="text-sm font-semibold">Ukrainian media variant (optional)</h4>
                {item.assetUk && (
                  <AdminMediaPreview
                    src={item.assetUk.imageUrl}
                    mimeType={mediaMime(item.assetUk)}
                    className="aspect-video w-full"
                    sizes="640px"
                    fit="contain"
                    controls
                  />
                )}
                <PhotoUploader
                  {...uploadProps}
                  multiple={false}
                  label={`${item.assetUk ? 'Replace' : 'Upload'} Ukrainian`}
                  onAssetUploadedAction={(assetUk) => patch(item.key, { assetUk })}
                />
                {item.assetUk && (
                  <AdminButton
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClickAction={() => patch(item.key, { assetUk: null })}
                  >
                    Remove Ukrainian variant
                  </AdminButton>
                )}
              </section>
              {item.legacyCover && (
                <p className="text-xs text-neutral-500">
                  Legacy cover usage. Existing gallery behaviour is preserved.
                </p>
              )}
              <AdminButton
                variant="outline"
                size="sm"
                disabled={disabled}
                onClickAction={() => {
                  setPendingDelete(item);
                  setEditing(null);
                }}
              >
                Remove this usage
              </AdminButton>
              <Dialog.Close className="ml-3 rounded-sm border border-neutral-300 px-3 py-2 text-sm">
                Done
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Root>
      <AdminPhotoLightbox
        photos={previews}
        index={preview}
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
              onChangeAction((current) =>
                current.filter((value) => value.key !== pendingDelete.key)
              );
            setPendingDelete(null);
          }}
        />
      )}
    </section>
  );
}
