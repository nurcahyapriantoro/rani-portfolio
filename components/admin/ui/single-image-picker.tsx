'use client';

import { useRef, useState } from 'react';
import { Upload, X, Star } from 'lucide-react';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  formatMB,
  isAllowedImageMime,
  overSizeMessage
} from '@/lib/storage/constants';

interface SingleImagePickerProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  section: string;
  hint?: string;
  accept?: string;
  rounded?: 'square' | 'circle';
}

// Describe a failed /api/upload response in terms the user can act on.
function describeUploadFailure(status: number, rawBody: string, serverMessage?: string): string {
  if (serverMessage) {
    if (/MB|MB\)|max|limit/i.test(serverMessage)) return serverMessage;
    return `${serverMessage} (Max upload size is ${formatMB(MAX_UPLOAD_BYTES)}.)`;
  }
  if (status === 0) {
    return 'Network error — the request never reached the server.';
  }
  if (status === 401) {
    return 'Your admin session has expired. Please refresh the page and log in again.';
  }
  if (status === 413) {
    return `File too large for the server. Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}. Please compress or resize the image and try again.`;
  }
  if (!rawBody) {
    return (
      `Upload failed (HTTP ${status}): the server returned an empty response. ` +
      `Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}. ` +
      `Please compress or resize the image and try again.`
    );
  }
  return `Upload failed (HTTP ${status}). Maximum upload size is ${formatMB(MAX_UPLOAD_BYTES)}.`;
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

    // Reject oversize / wrong-type files BEFORE issuing the request. Without
    // this, an oversize photo gets an empty response from Vercel and produces
    // the cryptic "Unexpected end of JSON input" SyntaxError.
    if (!isAllowedImageMime(file)) {
      setError(`"${file.name}" is not a supported image. Please upload a JPG, PNG, WebP, GIF, or SVG.`);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(overSizeMessage(file.name, file.size));
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('section', section);
      fd.append('hint', file.name);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      // Read raw text first so an empty/non-JSON server response becomes a
      // useful upload error instead of the opaque "Unexpected end of JSON
      // input" SyntaxError from a failed .json() call on an empty body.
      const body = await res.text();
      let result: { ok?: boolean; error?: string; files?: Array<{ url: string }> };
      try {
        result = body ? JSON.parse(body) : {};
      } catch {
        result = {};
      }
      if (!res.ok || !result.ok || !Array.isArray(result.files)) {
        setError(describeUploadFailure(res.status, body, result.error));
        console.error('[single-image upload]', { status: res.status, body, result });
        return;
      }
      onChange(result.files[0].url as string);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setError(`Upload failed: ${msg}. Check your connection and try again.`);
      console.error('[single-image upload] network/runtime error', e);
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
                <X className="w-3 h-3" />
                Remove
              </button>
            )}
          </div>
          {!error && (
            <p className="text-[11px] text-text-muted">
              Max {MAX_UPLOAD_MB.toFixed(1)} MB · {hint ?? 'JPG, PNG, WebP, GIF, or SVG'}
            </p>
          )}
          {error && (
            <div
              role="alert"
              className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs space-y-1"
            >
              <p className="font-semibold">Upload failed</p>
              <p>{error}</p>
              <p className="text-red-400/80">
                Tip: maximum upload size is {formatMB(MAX_UPLOAD_BYTES)}. Compress or resize the image and try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
