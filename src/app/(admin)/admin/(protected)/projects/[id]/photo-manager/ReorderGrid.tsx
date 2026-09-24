'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EditablePhoto } from './types';
import { AdminMediaPreview } from '@/app/(admin)/admin/(protected)/_components/AdminMediaPreview';

// ── Sortable card ─────────────────────────────────────────────────────────────

type CardProps = {
  item: EditablePhoto;
  index: number;
};

function SortablePhotoCard({ item, index }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
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
      className={`relative cursor-grab overflow-hidden rounded-lg border transition-shadow select-none active:cursor-grabbing ${isDragging ? 'z-10 border-neutral-400 opacity-80 shadow-xl' : 'border-neutral-200 shadow-sm hover:shadow-md'}`}
    >
      <AdminMediaPreview
        src={item.imageUrl}
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
  items: EditablePhoto[];
  onReorderChangeAction: (reordered: EditablePhoto[]) => void;
};

export function ReorderGrid({ items, onReorderChangeAction }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    onReorderChangeAction(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4" data-component="ReorderGrid">
      <p className="mb-4 text-sm text-neutral-500">
        Перетягуйте фото, щоб змінити порядок. Збережіть через кнопку у тулбарі.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {items.map((item, index) => (
              <SortablePhotoCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
