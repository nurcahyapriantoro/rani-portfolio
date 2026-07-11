import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { ContentStorage, ContentShape, Locale } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const LOCK_DIR = path.join(os.tmpdir(), 'rani-portfolio-locks');

let cache: { data: ContentShape; ts: number } | null = null;
const CACHE_TTL_MS = 1000;

async function ensureDirs() {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.mkdir(LOCK_DIR, { recursive: true });
}

async function readFile(locale: Locale): Promise<ContentShape> {
  const filePath = path.join(CONTENT_DIR, `${locale}.json`);
  const raw = await fs.readFile(filePath, 'utf-8');
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
    const filePath = path.join(CONTENT_DIR, `${locale}.json`);
    const tempPath = path.join(LOCK_DIR, `${locale}-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);
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

  async updateBilingualSection(
    enData: unknown,
    idData: unknown,
    key: string
  ): Promise<{ success: true }> {
    const enContent = await this.readContent('en');
    const idContent = await this.readContent('id');
    const enBackup = JSON.parse(JSON.stringify(enContent));
    const idBackup = JSON.parse(JSON.stringify(idContent));

    enContent[key] = enData;
    await this.writeContent('en', enContent);

    try {
      idContent[key] = idData;
      await this.writeContent('id', idContent);
    } catch (err) {
      await this.writeContent('en', enBackup);
      throw err;
    }
    return { success: true };
  }
}