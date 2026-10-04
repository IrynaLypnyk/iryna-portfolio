'use client';

import { isDraftEqual, toEditableFields } from './helpers';
import type { EditablePhoto, RowStatus, UpdateDraft } from './types';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { Trash2 } from 'lucide-react';
import { AdminChip } from '@/app/(admin)/admin/_components/AdminChip';
import { AdminInput } from '@/app/(admin)/admin/(protected)/_components/AdminInput';
import { AdminMediaPreview } from '@/app/(admin)/admin/(protected)/_components/AdminMediaPreview';

type Props = {
  item: EditablePhoto;
  status: RowStatus;
  onDraftChangeAction: UpdateDraft;
  onSaveAction: (item: EditablePhoto) => void;
  onDeleteAction: (item: EditablePhoto) => void;
  onResetDraftAction: (item: EditablePhoto) => void;
  onPreviewAction: () => void;
};

export function PhotoTableRow({
  item,
  status,
  onDraftChangeAction,
  onSaveAction,
  onDeleteAction,
  onResetDraftAction,
  onPreviewAction,
}: Props) {
  const hasUnsavedChanges = !isDraftEqual(item.draft, toEditableFields(item));

  return (
    <tr
      className={`border-t border-neutral-200 align-top ${hasUnsavedChanges ? 'bg-amber-50' : ''}`}
    >
      {/* Thumbnail — clickable for preview */}
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={onPreviewAction}
          className="group relative block overflow-hidden rounded-md"
          aria-label="Переглянути фото"
        >
          <AdminMediaPreview src={item.imageUrl} className="h-20 w-28 rounded-md" sizes="112px" />
          <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
            <span className="text-xs font-medium">Переглянути</span>
          </span>
        </button>
      </td>

      {/* Project cover */}
      <td className="px-3 py-3">
        <AdminChip
          label="Обкл. проєкту"
          checked={item.draft.isProjectCover}
          onChangeAction={(checked) => onDraftChangeAction(item.id, 'isProjectCover', checked)}
        />
      </td>

      {/* Captions, gallery link & description */}
      <td className="px-3 py-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <AdminInput
            type="text"
            value={item.draft.captionUk ?? ''}
            placeholder="Підпис (UA)"
            aria-label="Підпис (UA)"
            onChange={(event) =>
              onDraftChangeAction(item.id, 'captionUk', event.target.value || null)
            }
          />
          <AdminInput
            type="text"
            value={item.draft.captionEn ?? ''}
            placeholder="Підпис (EN)"
            aria-label="Підпис (EN)"
            onChange={(event) =>
              onDraftChangeAction(item.id, 'captionEn', event.target.value || null)
            }
          />

          <AdminInput
            type="url"
            value={item.draft.linkUrl ?? ''}
            placeholder="Посилання для галереї (необов'язково)"
            aria-label="Посилання для галереї"
            className="sm:col-span-2"
            onChange={(event) =>
              onDraftChangeAction(item.id, 'linkUrl', event.target.value || null)
            }
          />

          <AdminInput
            type="text"
            value={item.draft.descriptionUk ?? ''}
            placeholder="Опис у галереї (UA)"
            aria-label="Опис у галереї (UA)"
            onChange={(event) =>
              onDraftChangeAction(item.id, 'descriptionUk', event.target.value || null)
            }
          />
          <AdminInput
            type="text"
            value={item.draft.descriptionEn ?? ''}
            placeholder="Опис у галереї (EN)"
            aria-label="Опис у галереї (EN)"
            onChange={(event) =>
              onDraftChangeAction(item.id, 'descriptionEn', event.target.value || null)
            }
          />
        </div>
      </td>

      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex flex-col gap-2">
          {hasUnsavedChanges || status === 'saving' ? (
            <AdminButton
              type="button"
              size="sm"
              onClickAction={() => onSaveAction(item)}
              disabled={status === 'saving' || status === 'deleting'}
              className={
                hasUnsavedChanges ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400' : ''
              }
            >
              {status === 'saving' ? 'Saving…' : 'Save changes'}
            </AdminButton>
          ) : (
            <span className="text-xs text-neutral-400">✓ Збережено</span>
          )}

          {hasUnsavedChanges && status === 'idle' && (
            <AdminButton
              variant="ghost"
              size="sm"
              type="button"
              onClickAction={() => onResetDraftAction(item)}
            >
              Cancel
            </AdminButton>
          )}

          <AdminButton
            variant="outline"
            tone="danger"
            size="sm"
            type="button"
            onClickAction={() => onDeleteAction(item)}
            disabled={status === 'saving' || status === 'deleting'}
            startIcon={<Trash2 size={14} strokeWidth={1.75} />}
          >
            {status === 'deleting' ? 'Deleting…' : 'Delete'}
          </AdminButton>
        </div>
      </td>
    </tr>
  );
}
