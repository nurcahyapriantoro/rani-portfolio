import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { ContentStorage, ContentShape, Locale } from './types';

// On Vercel the project root is read-only, so writes go to `/tmp`. Reads prefer
// `/tmp` (so admin edits are picked up immediately) and fall back to the
// `content/<locale>.json` bundled with the deployment.
//
// IMPORTANT: every filesystem operation is wrapped so a missing file, a
// permission error, or a path containing unexpected characters never throws
// an ENOENT/EPERM up the call chain. The previous behaviour was to throw,
// which broke page rendering and surfaced as the opaque
// "Failed to execute 'json' on 'Response'" error during RSC fetches.
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
  try {
    await fs.mkdir(getWriteDir(), { recursive: true });
    await fs.mkdir(LOCK_DIR, { recursive: true });
  } catch (e) {
    // Surface a clear log instead of letting mkdir failure crash reads.
    console.error('[fs-content] ensureDirs failed', e);
  }
}

async function tryReadFile(path: string): Promise<string | null> {
  try {
    return await fs.readFile(path, 'utf-8');
  } catch {
    return null;
  }
}

async function readFileForLocale(locale: Locale): Promise<ContentShape | null> {
  // Reject obvious garbage values defensively (e.g. asset paths that get
  // routed here by Next.js, like "favicon.png").
  if (!locale || typeof locale !== 'string' || /[^a-z0-9-]/i.test(locale) || locale.length > 32) {
    return null;
  }

  if (isVercel) {
    const tmpPath = path.join(TMP_CONTENT_DIR, `${locale}.json`);
    const tmpRaw = await tryReadFile(tmpPath);
    if (tmpRaw !== null) {
      try {
        return JSON.parse(tmpRaw) as ContentShape;
      } catch {
        // Corrupt file — fall through to bundled content.
      }
    }
  }
  const bundledPath = path.join(BUNDLED_CONTENT_DIR, `${locale}.json`);
  const bundledRaw = await tryReadFile(bundledPath);
  if (bundledRaw === null) return null;
  try {
    return JSON.parse(bundledRaw) as ContentShape;
  } catch {
    return null;
  }
}

export class FSContentStorage implements ContentStorage {
  async readContent(locale: Locale): Promise<ContentShape> {
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
      return cache.data;
    }
    const data = (await readFileForLocale(locale)) ?? {};
    cache = { data, ts: Date.now() };
    return data;
  }

  async writeContent(locale: Locale, data: ContentShape): Promise<void> {
    if (!locale || /[^a-z0-9-]/i.test(locale) || locale.length > 32) {
      throw new Error(`Invalid locale for writeContent: ${locale}`);
    }
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
