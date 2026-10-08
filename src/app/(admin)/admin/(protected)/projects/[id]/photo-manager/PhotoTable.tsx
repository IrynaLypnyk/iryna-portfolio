'use client';

import { PhotoTableRow } from './PhotoTableRow';
import type { EditablePhoto, RowStatus, UpdateDraft } from './types';

const photoTableHeadCellStyles = 'border-b border-neutral-200 bg-neutral-100 px-3 py-3';

type Props = {
  items: EditablePhoto[];
  statuses: Record<string, RowStatus>;
  onDraftChangeAction: UpdateDraft;
  onSaveAction: (item: EditablePhoto) => void;
  onDeleteAction: (item: EditablePhoto) => void;
  onResetDraftAction: (item: EditablePhoto) => void;
  onPreviewAction: (index: number) => void;
};

export function PhotoTable({
  items,
  statuses,
  onDraftChangeAction,
  onSaveAction,
  onDeleteAction,
  onResetDraftAction,
  onPreviewAction,
}: Props) {
  const sortedItems = items.slice().sort((a, b) => a.orderInProject - b.orderInProject);

  return (
    <div className="min-w-0 bg-white">
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-200 border-separate border-spacing-0 text-sm">
          <thead className="text-left">
            <tr>
              <th className={`${photoTableHeadCellStyles} w-32`}>Media</th>
              <th className={`${photoTableHeadCellStyles} w-36`}>Cover</th>
              <th className={photoTableHeadCellStyles}>Labels, links and description in gallery</th>
              <th className={`${photoTableHeadCellStyles} w-36`}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedItems.map((item, index) => (
              <PhotoTableRow
                key={item.id}
                item={item}
                status={statuses[item.id] ?? 'idle'}
                onDraftChangeAction={onDraftChangeAction}
                onSaveAction={onSaveAction}
                onDeleteAction={onDeleteAction}
                onResetDraftAction={onResetDraftAction}
                onPreviewAction={() => onPreviewAction(index)}
              />
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="p-10 text-center text-sm text-neutral-500">
            Поки що немає фото. Натисніть «Upload photo», щоб додати перший файл.
          </div>
        )}
      </div>
    </div>
  );
}
