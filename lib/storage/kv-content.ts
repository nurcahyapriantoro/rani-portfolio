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

  async updateBilingualSection(
    enData: unknown,
    idData: unknown,
    key: string
  ): Promise<{ success: true }> {
    const client = this.client;
    const enKey = this.key('en');
    const idKey = this.key('id');

    const enBackup = await client.get<ContentShape>(enKey);
    const idBackup = await client.get<ContentShape>(idKey);

    const enContent: ContentShape = { ...(enBackup as ContentShape), [key]: enData };
    await client.set(enKey, enContent);

    try {
      const idContent: ContentShape = { ...(idBackup as ContentShape), [key]: idData };
      await client.set(idKey, idContent);
    } catch (err) {
      await client.set(enKey, enBackup);
      throw err;
    }
    return { success: true };
  }
}