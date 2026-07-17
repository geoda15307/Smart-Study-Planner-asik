export const OCR_SUPPORTED_MIME_TYPES = ["image/png", "image/jpeg", "application/pdf"];

export function isSupportedForOCR(mimeType: string): boolean {
  return OCR_SUPPORTED_MIME_TYPES.includes(mimeType);
}
