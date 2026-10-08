'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { PhotoTable } from './photo-manager/PhotoTable';
import { PhotoUploader } from './photo-manager/PhotoUploader';
import { ReorderGrid } from './photo-manager/ReorderGrid';
import { AdminPhotoLightbox } from './photo-manager/AdminPhotoLightbox';
import { DeletePhotoDialog } from './photo-manager/DeletePhotoDialog';
import { toEditablePhoto, toEditableFields } from './photo-manager/helpers';
import type {
  EditableFields,
  EditablePhoto,
  PhotoManagerProps,
  PhotoRow as PhotoRowType,
  RowStatus,
} from './photo-manager/types';
import { apiRoutes } from '@/constants/routes';
import { useUnsavedChanges } from '../../_components/UnsavedChangesProvider';

export type { PhotoRow } from './photo-manager/types';

export function PhotoManager({ projectId, photos }: PhotoManagerProps) {
  const [items, setItems] = useState<EditablePhoto[]>(() => photos.map(toEditablePhoto));
  const [statuses, setStatuses] = useState<Record<string, RowStatus>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EditablePhoto | null>(null);

  // ── Reorder mode ─────────────────────────────────────────────────────────────
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderItems, setReorderItems] = useState<EditablePhoto[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  function enterReorderMode() {
    const sorted = items.slice().sort((a, b) => a.orderInProject - b.orderInProject);
    setReorderItems(sorted);
    setIsReorderMode(true);
  }

  async function saveOrder(): Promise<boolean> {
    setIsSavingOrder(true);

    const payload = reorderItems.map((item, index) => ({
      id: item.id,
      orderInProject: index + 1,
    }));

    try {
      const response = await fetch(apiRoutes.admin.photos.reorder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || 'Не вдалося зберегти порядок');
      }

      const reordered = reorderItems.map((item, index) => ({
        ...item,
        orderInProject: index + 1,
        draft: { ...item.draft, orderInProject: index + 1 },
      }));

      setReorderItems(reordered);
      setItems(reordered);
      toast.success('Order збережено');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося зберегти порядок');
      return false;
    } finally {
      setIsSavingOrder(false);
    }
  }

  async function exitReorder(save: boolean) {
    if (save) {
      const ok = await saveOrder();
      if (!ok) return; // stay in reorder mode on error
    }
    setIsReorderMode(false);
    setReorderItems([]);
  }

  // ── Photo metadata ────────────────────────────────────────────────────────────

  function updateDraft<Key extends keyof EditableFields>(
    id: string,
    key: Key,
    value: EditableFields[Key]
  ) {
    setItems((current) =>
      current.map((item) => {
        // Single-choice: when project cover is set on one photo, clear all others.
        if (key === 'isProjectCover' && value === true && item.id !== id) {
          return { ...item, draft: { ...item.draft, isProjectCover: false } };
        }

        if (item.id !== id) {
          return item;
        }

        return { ...item, draft: { ...item.draft, [key]: value } };
      })
    );
  }

  async function saveRow(item: EditablePhoto) {
    setStatuses((current) => ({ ...current, [item.id]: 'saving' }));

    try {
      const response = await fetch(apiRoutes.admin.photos.item(item.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.draft),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || 'Не вдалося зберегти медіафайл');
      }

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, ...item.draft } : currentItem
        )
      );

      toast.success('Медіафайл збережено');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося зберегти медіафайл');
    } finally {
      setStatuses((current) => ({ ...current, [item.id]: 'idle' }));
    }
  }

  function resetDraft(item: EditablePhoto) {
    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id
          ? { ...currentItem, draft: toEditableFields(currentItem) }
          : currentItem
      )
    );
  }

  async function deleteRow(item: EditablePhoto) {
    setPendingDelete(item);
  }

  async function confirmDelete(item: EditablePhoto) {
    setPendingDelete(null);
    setStatuses((current) => ({ ...current, [item.id]: 'deleting' }));

    try {
      const response = await fetch(apiRoutes.admin.photos.item(item.id), {
        method: 'DELETE',
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || 'Не вдалося видалити медіафайл');
      }

      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      toast.success('Медіафайл видалено');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити медіафайл');
      setStatuses((current) => ({ ...current, [item.id]: 'idle' }));
    }
  }

  function addPhoto(photo: PhotoRowType) {
    setItems((current) => [...current, toEditablePhoto(photo)]);
  }

  const sortedItems = items.slice().sort((a, b) => a.orderInProject - b.orderInProject);
  const hasUnsavedOrder =
    isReorderMode &&
    (reorderItems.length !== sortedItems.length ||
      reorderItems.some((item, index) => item.id !== sortedItems[index]?.id));
  useUnsavedChanges(hasUnsavedOrder);

  return (
    <div className="min-w-0 space-y-4">
      <PhotoUploader
        projectId={projectId}
        photoCount={items.length}
        onPhotoUploadedAction={addPhoto}
        onEnterReorderAction={enterReorderMode}
        isReorderMode={isReorderMode}
        isSavingOrder={isSavingOrder}
        hasUnsavedOrder={hasUnsavedOrder}
        onSaveOrderAction={saveOrder}
        onExitReorderAction={exitReorder}
      />

      {isReorderMode ? (
        <ReorderGrid items={reorderItems} onReorderChangeAction={setReorderItems} />
      ) : (
        <div className="min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <PhotoTable
            items={sortedItems}
            statuses={statuses}
            onDraftChangeAction={updateDraft}
            onSaveAction={saveRow}
            onDeleteAction={deleteRow}
            onResetDraftAction={resetDraft}
            onPreviewAction={setLightboxIndex}
          />
        </div>
      )}

      <AdminPhotoLightbox
        photos={sortedItems.map((item) => ({
          src: item.imageUrl,
          mimeType: item.mimeType,
          width: item.width,
          height: item.height,
        }))}
        index={lightboxIndex}
        onCloseAction={() => setLightboxIndex(null)}
      />

      {pendingDelete && (
        <DeletePhotoDialog
          photo={pendingDelete}
          onConfirmAction={() => confirmDelete(pendingDelete)}
          onCancelAction={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
