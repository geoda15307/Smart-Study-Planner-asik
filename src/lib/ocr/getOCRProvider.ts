import type { OCRProvider } from "./types";
import { ocrSpaceProvider } from "./providers/ocrSpaceProvider";

const providers: Record<string, OCRProvider> = {
  ocrspace: ocrSpaceProvider
};

// Belum dipanggil dari DocumentService — lihat docs/SPRINT_1_ARCHITECTURE_FREEZE.md.
// Disiapkan sekarang supaya DocumentService nanti tinggal memanggil ini tanpa
// perlu tahu provider OCR apa yang aktif (sama seperti lib/ai/getAIProvider.ts).
export function getOCRProvider(): OCRProvider {
  const providerName = process.env.OCR_PROVIDER ?? "ocrspace";
  return providers[providerName] ?? ocrSpaceProvider;
}
