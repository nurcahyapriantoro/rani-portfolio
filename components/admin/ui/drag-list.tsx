'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface DragListProps<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, handle: React.ReactNode) => React.ReactNode;
  className?: string;
}

export function DragList<T extends { id: string }>({
  items,
  onChange,
  renderItem,
  className = ''
}: DragListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    onChange(arrayMove(items, idx, target));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-3 ${className}`}>
          {items.map((item, i) =>
            renderItem(
              item,
              i,
              <DragHandle id={item.id} index={i} onMove={move} total={items.length} />
            )
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function DragHandle({
  id,
  index,
  onMove,
  total
}: {
  id: string;
  index: number;
  onMove: (idx: number, dir: -1 | 1) => void;
  total: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="inline-flex items-center gap-0.5 mr-2 select-none"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1.5 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-accent cursor-grab active:cursor-grabbing transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className="p-0.5 rounded text-text-muted hover:text-accent disabled:opacity-30 transition-colors"
          aria-label="Move up"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          className="p-0.5 rounded text-text-muted hover:text-accent disabled:opacity-30 transition-colors"
          aria-label="Move down"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}