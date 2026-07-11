import 'server-only';
import type { ContentStorage, UploadStorage, Locale, ContentShape } from './types';
import { FSContentStorage } from './fs-content';
import { FSUploadStorage } from './fs-upload';
import { KVContentStorage } from './kv-content';
import { BlobUploadStorage } from './blob-upload';
import { GitHubContentStorage } from './github-content';
import { GitHubUploadStorage } from './github-upload';

let _content: ContentStorage | null = null;
let _upload: UploadStorage | null = null;

export type StorageBackend = 'fs' | 'kv' | 'github';

function detectContentBackend(): StorageBackend {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) return 'kv';
  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return 'github';
  return 'fs';
}

function detectUploadBackend(): StorageBackend {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'kv'; // Vercel Blob
  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return 'github';
  return 'fs';
}

export function getContentStorage(): ContentStorage {
  if (_content) return _content;
  const backend = detectContentBackend();
  switch (backend) {
    case 'kv':
      _content = new KVContentStorage();
      break;
    case 'github':
      _content = new GitHubContentStorage();
      break;
    default:
      _content = new FSContentStorage();
  }
  return _content;
}

export function getUploadStorage(): UploadStorage {
  if (_upload) return _upload;
  const backend = detectUploadBackend();
  switch (backend) {
    case 'kv':
      _upload = new BlobUploadStorage();
      break;
    case 'github':
      _upload = new GitHubUploadStorage();
      break;
    default:
      _upload = new FSUploadStorage();
  }
  return _upload;
}

export function getStorageInfo() {
  return {
    content: detectContentBackend(),
    upload: detectUploadBackend()
  };
}

// Convenience wrappers re-exporting the interface
export async function readContent(locale: Locale): Promise<ContentShape> {
  return getContentStorage().readContent(locale);
}

export { type Locale, type ContentShape };
export type { ContentStorage, UploadStorage };