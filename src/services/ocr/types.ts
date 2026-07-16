import type { UploadedFileMeta } from "@/types";

export interface OCRResult {
  text: string;
  confidence?: number;
  pageCount?: number;
}

export interface OCRProvider {
  name: string;
  extractText(file: Blob, meta: UploadedFileMeta): Promise<OCRResult>;
}
