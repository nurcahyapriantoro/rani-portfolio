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
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  formatMB,
  isAllowedImageMime,
  overSizeMessage
} from '@/lib/storage/constants';

interface ImageListPickerProps {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  section: string;
  hint?: string;
  maxItems?: number;
}

// Describe a failed /api/upload response in terms the user can act on.
// Returns a copy-friendly string that ALWAYS mentions the 3.5 MB cap so
// users know why their file was rejected and what to do next.
function describeUploadFailure(
  status: number,
  rawBody: string,
  serverMessage?: string
): string {
  if (serverMessage) {
    // Trust the server's error verbatim — it already includes the cap and the
    // actual file size, so we don't need to re-state the limit unless the
    // server message somehow missed it.
    if (/MB|MB\)|max|limit/i.test(serverMessage)) return serverMessage;
    return `${serverMessage} (Max upload size is ${formatMB(MAX_UPLOAD_BYTES)}.)`;
  }

  if (status === 0) {
    return 'Network error — the request never reached the server. Check your connection and try again.';
  }
  if (status === 401) {
    return 'Your admin session has expired. Please refresh the page and log in again.';
  }
  if (status === 413) {
    return `File too large for the server. Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}. Please compress or resize the image and try again.`;
  }
  if (!rawBody) {
    // The server returned nothing — almost always a Vercel body-size cap.
    return (
      `Upload failed (HTTP ${status}): the server returned an empty response. ` +
      `Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}. ` +
      `Please compress or resize the image and try again.`
    );
  }
  return `Upload failed (HTTP ${status}). Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}.`;
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

  // Compose the hint so the user always sees the size limit, even if a parent
  // form did not supply one.
  const limitHint =
    `Max ${MAX_UPLOAD_MB.toFixed(1)} MB per image · ${hint ?? 'JPG, PNG, WebP, GIF, or SVG. Drag to reorder.'}`;

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const fileArr = Array.from(files);

    // ---- Client-side validation BEFORE issuing the request ----
    // Without this, oversized files get rejected by Vercel with an empty body
    // and the user sees the cryptic "Unexpected end of JSON input".
    for (const f of fileArr) {
      if (!isAllowedImageMime(f)) {
        setError(
          `"${f.name}" is not a supported image (${f.type || 'unknown file type'}). ` +
            `Please upload a JPG, PNG, WebP, GIF, or SVG.`
        );
        return;
      }
      if (f.size > MAX_UPLOAD_BYTES) {
        setError(overSizeMessage(f.name, f.size));
        return;
      }
    }
    if (maxItems && values.length + fileArr.length > maxItems) {
      setError(`Maximum ${maxItems} images. You currently have ${values.length} and tried to add ${fileArr.length}.`);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of fileArr) {
        fd.append('files', f);
        fd.append('hint', f.name);
      }
      fd.append('section', section);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      // Read the raw body first so an empty/non-JSON server response (which
      // happens when Vercel closes the connection because of body-size limits)
      // becomes a useful upload error instead of the opaque
      // "Unexpected end of JSON input" SyntaxError.
      const body = await res.text();
      let data: { ok?: boolean; error?: string; files?: Array<{ url: string }> };
      try {
        data = body ? JSON.parse(body) : {};
      } catch {
        data = {};
      }
      if (!res.ok || !data.ok || !Array.isArray(data.files)) {
        const reason = describeUploadFailure(res.status, body, data.error);
        setError(reason);
        // Console-log for debugging without changing UX
        console.error('[upload]', { status: res.status, body, parsedError: data.error });
        return;
      }
      const urls: string[] = data.files.map((f) => f.url);
      onChange([...values, ...urls]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setError(`Upload failed: ${msg}. Check your network connection and try again.`);
      console.error('[upload] network/runtime error', e);
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
      {hint && !error && <p className="mt-1 text-xs text-text-muted">{limitHint}</p>}
      {error && (
        <div
          role="alert"
          className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs space-y-1"
        >
          <p className="font-semibold">Upload failed</p>
          <p>{error}</p>
          <p className="text-red-400/80">
            Tip: maximum upload size is {formatMB(MAX_UPLOAD_BYTES)}. Compress or resize the image and try again.
          </p>
        </div>
      )}
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