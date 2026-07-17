import type { DocumentCategory, ProcessorResult, UploadedFileMeta } from "@/types";

export interface DocumentProcessor {
  readonly category: DocumentCategory;
  readonly name: string;
  process(blob: Blob, meta: UploadedFileMeta): Promise<ProcessorResult>;
}
