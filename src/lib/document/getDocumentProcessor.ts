import type { DocumentCategory } from "@/types";
import type { DocumentProcessor } from "./types";
import { imageProcessor } from "./processors/imageProcessor";
import { pdfProcessor } from "./processors/pdfProcessor";
import { documentFileProcessor } from "./processors/documentFileProcessor";
import { spreadsheetProcessor } from "./processors/spreadsheetProcessor";
import { presentationProcessor } from "./processors/presentationProcessor";

const processors: Record<DocumentCategory, DocumentProcessor> = {
  image: imageProcessor,
  pdf: pdfProcessor,
  document: documentFileProcessor,
  spreadsheet: spreadsheetProcessor,
  presentation: presentationProcessor
};

export function getDocumentProcessor(category: DocumentCategory): DocumentProcessor {
  return processors[category];
}
