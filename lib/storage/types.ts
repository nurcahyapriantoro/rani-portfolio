export type Locale = 'en' | 'id';

export type ContentShape = Record<string, unknown>;

export interface ContentStorage {
  readContent(locale: Locale): Promise<ContentShape>;
  writeContent(locale: Locale, data: ContentShape): Promise<void>;
  updateSection(locale: Locale, key: string, data: unknown): Promise<{ success: true }>;
  updateBilingualSection(
    enData: unknown,
    idData: unknown,
    key: string
  ): Promise<{ success: true }>;
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

export interface UploadStorage {
  saveUpload(file: File, section: string, hint: string): Promise<UploadResult | UploadError>;
}