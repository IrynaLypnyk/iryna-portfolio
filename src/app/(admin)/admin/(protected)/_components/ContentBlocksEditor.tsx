'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react';
import { AdminButton } from '../../_components/AdminButton';
import { AdminInput } from './AdminInput';
import { AdminTextarea } from './AdminTextarea';
import { AdminDeleteDialog } from './AdminDeleteDialog';
import { MediaEditor, type MediaEditorProps } from './MediaEditor';
import {
  newContentBlock,
  moveContentBlock,
  type BlockMediaDraft,
} from '@/lib/media/owner-media-draft';

type Props = Pick<
  MediaEditorProps,
  'ownerId' | 'ownerType' | 'disabled' | 'onUploadingChangeAction'
> & {
  blocks: BlockMediaDraft[];
  onChangeAction: Dispatch<SetStateAction<BlockMediaDraft[]>>;
};

export function ContentBlocksEditor({ blocks, onChangeAction, ...shared }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [removing, setRemoving] = useState<string | null>(null);
  function update(key: string, field: 'titleEn' | 'titleUk' | 'bodyEn' | 'bodyUk', value: string) {
    onChangeAction((current) =>
      current.map((block) => (block.key === key ? { ...block, [field]: value || null } : block))
    );
  }
  return (
    <section aria-label="Content blocks" className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Content blocks</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Titles, text and media are optional. Use blank lines between paragraphs.
          </p>
        </div>
        <AdminButton
          variant="outline"
          disabled={shared.disabled}
          startIcon={<Plus size={14} />}
          onClickAction={() => {
            const key = crypto.randomUUID();
            setExpanded((current) => new Set(current).add(key));
            onChangeAction((current) => [...current, newContentBlock(key)]);
          }}
        >
          Add block
        </AdminButton>
      </div>
      {blocks.map((block, index) => (
        <div
          key={block.key}
          className="min-w-0 space-y-4 rounded-sm border border-neutral-200 bg-white p-4 sm:p-5"
          data-block-key={block.key}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              aria-expanded={expanded.has(block.key)}
              aria-controls={`block-${block.key}`}
              onClick={() =>
                setExpanded((current) => {
                  const next = new Set(current);
                  if (next.has(block.key)) next.delete(block.key);
                  else next.add(block.key);
                  return next;
                })
              }
              className="min-w-0 flex-1 text-left text-sm font-medium break-words text-neutral-800"
            >
              <span className="mr-2 text-neutral-500">
                {expanded.has(block.key) ? '▾' : '▸'} {index + 1}.
              </span>
              {block.titleEn || block.titleUk || 'Untitled block'}
              <span className="ml-2 text-xs font-normal text-neutral-500">
                {block.photos.length} media{!block.id && ' · not saved'}
              </span>
            </button>
            <div className="flex gap-2">
              <AdminButton
                variant="icon"
                size="sm"
                disabled={shared.disabled || index === 0}
                aria-label={`Move block ${index + 1} up`}
                onClickAction={() =>
                  onChangeAction((current) => moveContentBlock(current, block.key, -1))
                }
              >
                <ArrowUp size={16} />
              </AdminButton>
              <AdminButton
                variant="icon"
                size="sm"
                disabled={shared.disabled || index === blocks.length - 1}
                aria-label={`Move block ${index + 1} down`}
                onClickAction={() =>
                  onChangeAction((current) => moveContentBlock(current, block.key, 1))
                }
              >
                <ArrowDown size={16} />
              </AdminButton>
              <AdminButton
                variant="icon"
                size="sm"
                disabled={shared.disabled}
                className="text-red-700 hover:text-red-800"
                aria-label={`Remove block ${index + 1}`}
                onClickAction={() => setRemoving(block.key)}
              >
                <Trash2 size={16} />
              </AdminButton>
            </div>
          </div>
          <div id={`block-${block.key}`} hidden={!expanded.has(block.key)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {(['titleEn', 'titleUk', 'bodyEn', 'bodyUk'] as const).map((field) => {
                const label = `${field.startsWith('title') ? 'Title' : 'Body'} (${field.endsWith('En') ? 'EN' : 'UK'}, optional)`;
                return (
                  <label key={field} className="space-y-1">
                    <span className="block text-xs font-semibold tracking-wider text-neutral-600 uppercase">
                      {label}
                    </span>
                    {field.startsWith('body') ? (
                      <AdminTextarea
                        rows={5}
                        value={block[field] ?? ''}
                        disabled={shared.disabled}
                        aria-label={`Block ${index + 1} ${label}`}
                        onChange={(event) => update(block.key, field, event.target.value)}
                      />
                    ) : (
                      <AdminInput
                        value={block[field] ?? ''}
                        disabled={shared.disabled}
                        aria-label={`Block ${index + 1} ${label}`}
                        onChange={(event) => update(block.key, field, event.target.value)}
                      />
                    )}
                  </label>
                );
              })}
            </div>
            <MediaEditor
              {...shared}
              context="block"
              items={block.photos}
              onChangeAction={(update) =>
                onChangeAction((current) =>
                  current.map((item) =>
                    item.key !== block.key
                      ? item
                      : {
                          ...item,
                          photos: typeof update === 'function' ? update(item.photos) : update,
                        }
                  )
                )
              }
            />
          </div>
        </div>
      ))}
      {removing && (
        <AdminDeleteDialog
          title="Remove content block?"
          confirmLabel="Remove block"
          description="The block and its media usages will be removed when you save the form. Files used elsewhere, including covers, will be kept."
          onCancelAction={() => setRemoving(null)}
          onConfirmAction={() => {
            if (!shared.disabled)
              onChangeAction((current) => current.filter((block) => block.key !== removing));
            setRemoving(null);
          }}
        />
      )}
    </section>
  );
}
