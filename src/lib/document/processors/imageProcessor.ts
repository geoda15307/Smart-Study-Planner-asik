import type { DocumentProcessor } from "../types";
import { getOCRProvider } from "../../ocr/getOCRProvider";

export const imageProcessor: DocumentProcessor = {
  category: "image",
  name: "image",
  async process(blob, meta) {
    const ocrResult = await getOCRProvider().extractText(blob, meta);

    if (!ocrResult.success) {
      return {
        status: "failed",
        errorCode: ocrResult.errorCode ?? "OCR_FAILED",
        errorMessage: ocrResult.errorMessage ?? "OCR gagal tanpa keterangan."
      };
    }

    return {
      status: "extracted",
      rawText: ocrResult.extractedText,
      pageCount: ocrResult.pageCount,
      confidence: ocrResult.confidence,
      provider: ocrResult.provider,
      processingTimeMs: ocrResult.processingTimeMs
    };
  }
};
