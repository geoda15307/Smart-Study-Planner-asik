import type { UploadedFileMeta } from "@/types";

export interface OCRResult {
  success: boolean;
  extractedText: string;
  confidence?: number;
  pageCount?: number;
  provider: string;
  processingTimeMs?: number;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

export interface OCRProvider {
  name: string;
  // Selalu resolve, tidak pernah reject untuk kegagalan operasional (API key
  // hilang, HTTP error, rate limit, OCR gagal, dst) — cek OCRResult.success,
  // bukan try/catch. Reject hanya untuk bug murni di luar domain OCR.
  extractText(file: Blob, meta: UploadedFileMeta): Promise<OCRResult>;
}
