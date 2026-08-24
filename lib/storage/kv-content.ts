import { createClient } from '@vercel/kv';
import type { ContentStorage, ContentShape, Locale } from './types';

export class KVContentStorage implements ContentStorage {
  private get client() {
    return createClient({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!
    });
  }

  private key(locale: Locale) {
    return `content:${locale}`;
  }

  async readContent(locale: Locale): Promise<ContentShape> {
    const client = this.client;
    const data = (await client.get<ContentShape>(this.key(locale))) as ContentShape | null;
    if (data) return data;
    return {};
  }

  async writeContent(locale: Locale, data: ContentShape): Promise<void> {
    const client = this.client;
    await client.set(this.key(locale), data);
  }

  async updateSection(locale: Locale, key: string, data: unknown): Promise<{ success: true }> {
    const content = await this.readContent(locale);
    content[key] = data;
    await this.writeContent(locale, content);
    return { success: true };
  }
}