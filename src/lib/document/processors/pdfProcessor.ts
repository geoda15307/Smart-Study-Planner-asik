import { extractText, getDocumentProxy } from "unpdf";
import type { DocumentProcessor } from "../types";

export const pdfProcessor: DocumentProcessor = {
  category: "pdf",
  name: "pdf",
  async process(blob) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
      const { text, totalPages } = await extractText(pdf, { mergePages: true });
      const trimmedText = text.trim();

      if (!trimmedText) {
        return {
          status: "failed",
          errorCode: "EMPTY_RESULT",
          errorMessage: "PDF tidak mengandung teks yang bisa diekstrak — kemungkinan hasil scan/gambar (butuh OCR, belum didukung untuk kategori PDF)."
        };
      }

      return {
        status: "extracted",
        rawText: trimmedText,
        pageCount: totalPages
      };
    } catch (error) {
      return {
        status: "failed",
        errorCode: "PARSE_ERROR",
        errorMessage: error instanceof Error ? error.message : "Gagal membaca PDF."
      };
    }
  }
};