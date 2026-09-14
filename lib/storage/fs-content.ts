import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { ContentStorage, ContentShape, Locale } from './types';

// On Vercel the project root is read-only, so writes go to `/tmp`. Reads prefer
// `/tmp` (so admin edits are picked up immediately) and fall back to the
// `content/<locale>.json` bundled with the deployment.
const BUNDLED_CONTENT_DIR = path.join(process.cwd(), 'content');
const TMP_CONTENT_DIR = path.join(os.tmpdir(), 'rani-portfolio-content');
const LOCK_DIR = path.join(os.tmpdir(), 'rani-portfolio-locks');

const isVercel = Boolean(process.env.VERCEL);

function getWriteDir(): string {
  return isVercel ? TMP_CONTENT_DIR : BUNDLED_CONTENT_DIR;
}

let cache: { data: ContentShape; ts: number } | null = null;
const CACHE_TTL_MS = 1000;

async function ensureDirs() {
  await fs.mkdir(getWriteDir(), { recursive: true });
  await fs.mkdir(LOCK_DIR, { recursive: true });
}

async function readFile(locale: Locale): Promise<ContentShape> {
  const tmpPath = path.join(TMP_CONTENT_DIR, `${locale}.json`);
  const bundledPath = path.join(BUNDLED_CONTENT_DIR, `${locale}.json`);

  // On Vercel, prefer the writable /tmp copy so admin edits are reflected.
  if (isVercel) {
    try {
      const raw = await fs.readFile(tmpPath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      /* fall through to bundled */
    }
  }
  const raw = await fs.readFile(bundledPath, 'utf-8');
  return JSON.parse(raw);
}

export class FSContentStorage implements ContentStorage {
  async readContent(locale: Locale): Promise<ContentShape> {
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
      return cache.data;
    }
    const data = await readFile(locale);
    cache = { data, ts: Date.now() };
    return data;
  }

  async writeContent(locale: Locale, data: ContentShape): Promise<void> {
    await ensureDirs();
    const writeDir = getWriteDir();
    const filePath = path.join(writeDir, `${locale}.json`);
    const tempPath = path.join(
      LOCK_DIR,
      `${locale}-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`
    );
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(tempPath, json, 'utf-8');
    await fs.rename(tempPath, filePath);
    cache = { data, ts: Date.now() };
  }

  async updateSection(locale: Locale, key: string, data: unknown): Promise<{ success: true }> {
    const content = await this.readContent(locale);
    content[key] = data;
    await this.writeContent(locale, content);
    return { success: true };
  }
}
