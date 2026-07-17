import mammoth from "mammoth";
import WordExtractor from "word-extractor";
import type { DocumentProcessor } from "../types";

const wordExtractor = new WordExtractor();

async function extractLegacyDoc(blob: Blob): Promise<string> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const doc = await wordExtractor.extract(buffer);
  return doc.getBody().trim();
}

async function extractDocx(blob: Blob): Promise<string> {
  // mammoth README menyebut opsi {arrayBuffer}, tapi source code aktualnya (lib/unzip.js)
  // cuma mengecek options.path/options.buffer — {arrayBuffer} gagal diam-diam ("Could not
  // find file in options"). Konversi ke Buffer eksplisit, sama seperti word-extractor.
  const buffer = Buffer.from(await blob.arrayBuffer());
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export const documentFileProcessor: DocumentProcessor = {
  category: "document",
  name: "document",
  async process(blob, meta) {
    const isLegacyDoc = meta.filename.toLowerCase().endsWith(".doc");

    try {
      const text = isLegacyDoc ? await extractLegacyDoc(blob) : await extractDocx(blob);

      if (!text) {
        return {
          status: "failed",
          errorCode: "EMPTY_RESULT",
          errorMessage: `Dokumen ${isLegacyDoc ? ".doc" : ".docx"} tidak mengandung teks yang bisa diekstrak.`
        };
      }

      return {
        status: "extracted",
        rawText: text
      };
    } catch (error) {
      return {
        status: "failed",
        errorCode: "PARSE_ERROR",
        errorMessage: error instanceof Error ? error.message : `Gagal membaca dokumen ${isLegacyDoc ? ".doc" : ".docx"}.`
      };
    }
  }
};
