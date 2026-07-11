'use client';

import { useState, useRef } from 'react';
import { Upload, X, Star, GripVertical } from 'lucide-react';
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
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageListPickerProps {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  section: string;
  hint?: string;
  maxItems?: number;
}

export function ImageListPicker({
  label,
  values,
  onChange,
  section,
  hint,
  maxItems
}: ImageListPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) {
        if (maxItems && values.length + (files.length - (Array.from(files).indexOf(f))) > maxItems) {
          setError(`Max ${maxItems} items`);
          break;
        }
        fd.append('files', f);
        fd.append('hint', f.name);
      }
      fd.append('section', section);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Upload failed');
        return;
      }
      const urls: string[] = data.files.map((f: { url: string }) => f.url);
      onChange([...values, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  const addByUrl = () => {
    const url = window.prompt('Paste image URL:');
    if (url) onChange([...values, url]);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = values.indexOf(active.id as string);
    const newIndex = values.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(values, oldIndex, newIndex));
  };

  return (
    <div>
      {label && (
        <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">{label}</label>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={values} strategy={rectSortingStrategy}>
          <div
            className="grid gap-1.5 mb-2"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}
          >
            {values.map((url, i) => (
              <SortableImage key={url} url={url} index={i} onRemove={() => remove(i)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          type="button"
          onClick={addByUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs hover:scale-105 transition-all"
        >
          <Star className="w-3.5 h-3.5" />
          Add URL
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SortableImage({
  url,
  index,
  onRemove
}: {
  url: string;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-video rounded-md overflow-hidden border border-border bg-bg-tertiary"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-between p-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-0.5 rounded bg-bg-primary/80 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
          aria-label="Drag"
        >
          <GripVertical className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-0.5 rounded bg-red-500/90 opacity-0 group-hover:opacity-100"
          aria-label="Remove"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
      <div className="absolute top-0.5 left-0.5 px-1 py-px rounded bg-bg-primary/80 text-[9px] font-mono leading-none">
        {index + 1}
      </div>
    </div>
  );
}