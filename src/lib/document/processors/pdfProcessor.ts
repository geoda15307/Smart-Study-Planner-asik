import { InvalidPDFException, PasswordException, PDFParse } from "pdf-parse";
import type { DocumentProcessor } from "../types";

export const pdfProcessor: DocumentProcessor = {
  category: "pdf",
  name: "pdf",
  async process(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const parser = new PDFParse({ data: arrayBuffer });

    try {
      const result = await parser.getText();
      const text = result.text.trim();

      if (!text) {
        return {
          status: "failed",
          errorCode: "EMPTY_RESULT",
          errorMessage: "PDF tidak mengandung teks yang bisa diekstrak — kemungkinan hasil scan/gambar (butuh OCR, belum didukung untuk kategori PDF)."
        };
      }

      return {
        status: "extracted",
        rawText: text,
        pageCount: result.total
      };
    } catch (error) {
      if (error instanceof PasswordException) {
        return {
          status: "failed",
          errorCode: "PASSWORD_PROTECTED",
          errorMessage: "PDF dilindungi password, tidak bisa diproses otomatis."
        };
      }
      if (error instanceof InvalidPDFException) {
        return {
          status: "failed",
          errorCode: "CORRUPT_FILE",
          errorMessage: "File PDF tidak valid atau rusak."
        };
      }
      return {
        status: "failed",
        errorCode: "PARSE_ERROR",
        errorMessage: error instanceof Error ? error.message : "Gagal membaca PDF."
      };
    } finally {
      await parser.destroy();
    }
  }
};
