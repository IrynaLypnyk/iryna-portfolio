'use client';
import { PhotoTableRow, type PhotoTableRowProps } from './PhotoTableRow';
import type { MediaDraft } from '@/lib/media/media-draft';
type Props = Omit<PhotoTableRowProps, 'item' | 'index'> & { items: MediaDraft[] };
export function PhotoTable({ items, ...props }: Props) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-sm border border-neutral-200 bg-white">
      <table className="w-full min-w-180 border-separate border-spacing-0 text-sm">
        <thead className="bg-neutral-100 text-left">
          <tr>
            {['Media variants', 'Captions, descriptions and link', 'Actions'].map((label) => (
              <th key={label} className="border-b border-neutral-200 px-3 py-3">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <PhotoTableRow key={item.key} item={item} index={index} {...props} />
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <p className="p-6 text-sm text-neutral-500">No media yet. Upload images or videos here.</p>
      )}
    </div>
  );
}
