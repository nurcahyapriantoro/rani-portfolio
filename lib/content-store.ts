import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export type Locale = 'en' | 'id';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const LOCK_DIR = path.join(os.tmpdir(), 'rani-portfolio-locks');

type ContentShape = Record<string, unknown>;

let cache: { data: ContentShape; ts: number } | null = null;
const CACHE_TTL_MS = 1000;

async function ensureDirs() {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.mkdir(LOCK_DIR, { recursive: true });
}

async function readContentRaw(locale: Locale): Promise<ContentShape> {
  const filePath = path.join(CONTENT_DIR, `${locale}.json`);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export async function readContent(locale: Locale): Promise<ContentShape> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.data;
  }
  const data = await readContentRaw(locale);
  cache = { data, ts: Date.now() };
  return data;
}

export async function writeContent(locale: Locale, data: ContentShape): Promise<void> {
  await ensureDirs();
  const filePath = path.join(CONTENT_DIR, `${locale}.json`);
  const tempPath = path.join(LOCK_DIR, `${locale}-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(tempPath, json, 'utf-8');
  await fs.rename(tempPath, filePath);
  cache = { data, ts: Date.now() };
}

export async function updateSection(
  locale: Locale,
  key: string,
  sectionData: unknown
): Promise<{ success: true }> {
  const content = await readContent(locale);
  content[key] = sectionData;
  await writeContent(locale, content);
  return { success: true };
}

export async function updateBilingualSection(
  enData: unknown,
  idData: unknown,
  key: string
): Promise<{ success: true }> {
  const enContent = await readContent('en');
  const idContent = await readContent('id');
  const enBackup = JSON.parse(JSON.stringify(enContent));
  const idBackup = JSON.parse(JSON.stringify(idContent));

  enContent[key] = enData;
  await writeContent('en', enContent);

  try {
    idContent[key] = idData;
    await writeContent('id', idContent);
  } catch (err) {
    await writeContent('en', enBackup);
    throw err;
  }
  return { success: true };
}

export function getSection<T = unknown>(data: ContentShape, key: string, fallback: T): T {
  const value = data[key];
  return (value === undefined || value === null ? fallback : (value as T));
}