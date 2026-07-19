'use client';

import { useRef, useState } from 'react';
import { Upload, X, Star } from 'lucide-react';

interface SingleImagePickerProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  section: string;
  hint?: string;
  accept?: string;
  rounded?: 'square' | 'circle';
}

export function SingleImagePicker({
  label,
  value,
  onChange,
  section,
  hint,
  accept = 'image/*',
  rounded = 'square'
}: SingleImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('section', section);
      fd.append('hint', file.name);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setError(result.error ?? 'Upload failed');
        return;
      }
      onChange(result.files[0].url as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const previewClass = rounded === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div>
      {label && (
        <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">{label}</label>
      )}
      <div className="flex items-start gap-3">
        <div
          className={`relative w-16 h-16 ${previewClass} overflow-hidden border border-border bg-bg-tertiary shrink-0 flex items-center justify-center`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[10px] text-text-muted text-center px-1">No image</span>
          )}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs hover:scale-105 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                  e.target.value = '';
                }}
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>
          {hint && !error && <p className="text-[10px] text-text-muted">{hint}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}