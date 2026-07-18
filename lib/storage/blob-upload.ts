import { put } from '@vercel/blob';
import crypto from 'crypto';
import type { UploadStorage, UploadResult, UploadError } from './types';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf'
]);

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_BYTES_CV = 20 * 1024 * 1024;

const SECTION_MAX_BYTES: Record<string, number> = {
  cv: MAX_BYTES_CV
};

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'file';
}

export function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    case 'application/pdf':
      return 'pdf';
    default:
      return 'bin';
  }
}

export class BlobUploadStorage implements UploadStorage {
  async saveUpload(file: File, section: string, hint: string): Promise<UploadResult | UploadError> {
    if (!ALLOWED_MIME.has(file.type)) {
      return { ok: false, error: `Unsupported file type: ${file.type}` };
    }
    const maxBytes = SECTION_MAX_BYTES[section] ?? MAX_BYTES;
    if (file.size > maxBytes) {
      return { ok: false, error: `File too large (max ${maxBytes / 1024 / 1024}MB)` };
    }
    if (file.size === 0) {
      return { ok: false, error: 'Empty file' };
    }

    const ext = extFromMime(file.type);
    const slug = sanitizeSlug(hint || file.name.replace(/\.[^.]+$/, ''));
    const hash = crypto.randomBytes(4).toString('hex');
    const filename = `${Date.now()}-${slug}-${hash}.${ext}`;
    const pathname = `${section}/${filename}`;

    try {
      const blob = await put(pathname, file, { access: 'public', addRandomSuffix: false });
      return { ok: true, url: blob.url, filename };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Upload failed' };
    }
  }
}