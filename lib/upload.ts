import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
]);

const MAX_BYTES = 5 * 1024 * 1024;

export async function ensureUploadDir(section: string) {
  const dir = path.join(UPLOAD_DIR, section);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

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
    default:
      return 'bin';
  }
}

export interface UploadResult {
  ok: true;
  url: string;
  filename: string;
}

export interface UploadError {
  ok: false;
  error: string;
}

export async function saveUpload(
  file: File,
  section: string,
  hint = ''
): Promise<UploadResult | UploadError> {
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: `Unsupported file type: ${file.type}` };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` };
  }
  if (file.size === 0) {
    return { ok: false, error: 'Empty file' };
  }

  const dir = await ensureUploadDir(section);
  const ext = extFromMime(file.type);
  const slug = sanitizeSlug(hint || file.name.replace(/\.[^.]+$/, ''));
  const hash = crypto.randomBytes(4).toString('hex');
  const filename = `${Date.now()}-${slug}-${hash}.${ext}`;
  const filePath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return {
    ok: true,
    url: `/uploads/${section}/${filename}`,
    filename
  };
}

export async function deleteUpload(url: string): Promise<boolean> {
  if (!url.startsWith('/uploads/')) return false;
  const filePath = path.join(process.cwd(), 'public', url);
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}