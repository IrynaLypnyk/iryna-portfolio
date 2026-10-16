'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mediaMime, type MediaDraft } from '@/lib/media/media-draft';
import { AdminMediaPreview } from '@/app/(admin)/admin/(protected)/_components/AdminMediaPreview';

// ── Sortable card ─────────────────────────────────────────────────────────────

type CardProps = {
  item: MediaDraft;
  index: number;
  disabled?: boolean;
};

function SortablePhotoCard({ item, index, disabled }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative cursor-grab overflow-hidden rounded-sm border transition-shadow select-none active:cursor-grabbing ${isDragging ? 'z-10 border-neutral-400 opacity-80 shadow-xl' : 'border-neutral-200 shadow-sm hover:shadow-md'}`}
    >
      <AdminMediaPreview
        src={item.asset.imageUrl}
        mimeType={mediaMime(item.asset)}
        className="aspect-[4/3] w-full rounded-none border-0"
      />
      <div className="absolute right-0 bottom-0 left-0 bg-black/50 px-2 py-1">
        <span className="text-xs font-medium text-white">#{index + 1}</span>
      </div>
    </div>
  );
}

// ── Reorder grid ──────────────────────────────────────────────────────────────

type Props = {
  items: MediaDraft[];
  disabled?: boolean;
  onReorderChangeAction: (reordered: MediaDraft[]) => void;
};

export function ReorderGrid({ items, onReorderChangeAction, disabled }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (disabled || !over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.key === active.id);
    const newIndex = items.findIndex((item) => item.key === over.id);
    onReorderChangeAction(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <div className="rounded-sm border border-neutral-200 bg-white p-4" data-component="ReorderGrid">
      <p className="mb-4 text-sm text-neutral-500">
        Drag media to reorder, or use Space and arrow keys. Changes apply with the main form Save.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.key)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {items.map((item, index) => (
              <SortablePhotoCard key={item.key} item={item} index={index} disabled={disabled} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
