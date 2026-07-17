import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import type { DocumentProcessor } from "../types";

const xmlParser = new XMLParser({ ignoreAttributes: true, textNodeName: "#text", trimValues: false });

// Cari semua node dengan key persis `targetKey` di kedalaman berapa pun, tanpa
// merekursi ke DALAM node yang sudah cocok (a:p tidak pernah bersarang di OOXML).
function findNodesByKey(node: unknown, targetKey: string, out: unknown[]): void {
  if (node === null || node === undefined || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item) => findNodesByKey(item, targetKey, out));
    return;
  }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === targetKey) {
      Array.isArray(value) ? out.push(...value) : out.push(value);
    } else {
      findNodesByKey(value, targetKey, out);
    }
  }
}

// Kumpulkan semua teks di bawah key `a:t` dalam satu paragraf, urut dokumen,
// digabung tanpa separator (spasi antar-run sudah bagian dari teksnya sendiri).
function collectRunText(node: unknown, out: string[]): void {
  if (typeof node === "string") {
    out.push(node);
    return;
  }
  if (node === null || node === undefined || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item) => collectRunText(item, out));
    return;
  }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === "a:t" && typeof value === "string") {
      out.push(value);
    } else {
      collectRunText(value, out);
    }
  }
}

function extractSlideText(slideXml: string): string {
  const parsed = xmlParser.parse(slideXml);
  const paragraphNodes: unknown[] = [];
  findNodesByKey(parsed, "a:p", paragraphNodes);

  return paragraphNodes
    .map((paragraph) => {
      const runs: string[] = [];
      collectRunText(paragraph, runs);
      return runs.join("");
    })
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

function slideNumber(fileName: string): number {
  return Number(fileName.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
}

export const presentationProcessor: DocumentProcessor = {
  category: "presentation",
  name: "presentation",
  async process(blob, meta) {
    if (meta.filename.toLowerCase().endsWith(".ppt")) {
      return {
        status: "failed",
        errorCode: "NOT_IMPLEMENTED",
        errorMessage: "Format .ppt (PowerPoint lama) tidak didukung — tidak ada library JS yang layak untuk format biner ini. Silakan convert ke .pptx."
      };
    }

    let slideFiles: string[];
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(await blob.arrayBuffer());
      slideFiles = Object.keys(zip.files)
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        .sort((a, b) => slideNumber(a) - slideNumber(b));
    } catch (error) {
      return {
        status: "failed",
        errorCode: "CORRUPT_FILE",
        errorMessage: error instanceof Error ? error.message : "File PPTX tidak valid atau rusak."
      };
    }

    if (slideFiles.length === 0) {
      return {
        status: "failed",
        errorCode: "CORRUPT_FILE",
        errorMessage: "Tidak ditemukan slide di dalam file PPTX ini."
      };
    }

    const slideTexts: string[] = [];
    for (const fileName of slideFiles) {
      const xmlContent = await zip.files[fileName].async("string");
      const text = extractSlideText(xmlContent);
      if (text) slideTexts.push(text);
    }

    const text = slideTexts.join("\n\n").trim();

    if (!text) {
      return {
        status: "failed",
        errorCode: "EMPTY_RESULT",
        errorMessage: "Presentasi tidak mengandung teks yang bisa diekstrak."
      };
    }

    return {
      status: "extracted",
      rawText: text,
      slideCount: slideFiles.length
    };
  }
};
