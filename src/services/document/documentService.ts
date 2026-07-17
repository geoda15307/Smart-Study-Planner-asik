import type {
  DocumentCategory,
  DocumentRecord,
  DocumentStatus,
  NormalizedContent,
  ProcessorOutcome,
  ProcessorResult,
  UploadedFileMeta
} from "@/types";
import { documentRepository } from "./documentRepository";
import { getFileFromStorage } from "@/services/storage/storageService";
import { nowISO } from "@/utils/date";

function normalizeContent(result: ProcessorResult, category: DocumentCategory): NormalizedContent | null {
  if (result.status !== "extracted") return null;
  return {
    text: result.rawText ?? "",
    sourceType: category,
    pageCount: result.pageCount,
    sheetNames: result.sheetNames,
    slideCount: result.slideCount
  };
}

function toDocumentStatus(outcome: ProcessorOutcome): DocumentStatus {
  return outcome === "extracted" ? "completed" : outcome;
}

// Processor (imageProcessor, dst) memanggil OCR yang butuh API key -> harus jalan di
// server. Route ini menyeberangi batas client/server, sama seperti services/ai/aiService.ts
// memanggil /api/ai/*. documentService sendiri TIDAK PERNAH mengimpor lib/document/*
// langsung — supaya kode bermuatan secret tidak pernah ikut ter-bundle ke client.
async function callProcessRoute(blob: Blob, meta: UploadedFileMeta, category: DocumentCategory): Promise<ProcessorResult> {
  const formData = new FormData();
  formData.append("file", blob, meta.filename);
  formData.append("meta", JSON.stringify(meta));
  formData.append("category", category);

  try {
    const response = await fetch("/api/document/process", { method: "POST", body: formData });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return {
        status: "failed",
        errorCode: "API_ROUTE_ERROR",
        errorMessage: body.message ?? `Pemrosesan dokumen gagal (HTTP ${response.status}).`
      };
    }
    return (await response.json()) as ProcessorResult;
  } catch (error) {
    return {
      status: "failed",
      errorCode: "NETWORK_ERROR",
      errorMessage: error instanceof Error ? error.message : "Gagal menghubungi server."
    };
  }
}

export async function processDocument(meta: UploadedFileMeta): Promise<DocumentRecord> {
  const category = meta.category;
  const startedAt = nowISO();

  const pending: DocumentRecord = {
    id: meta.id,
    category,
    status: "pending",
    content: null,
    createdAt: startedAt,
    updatedAt: startedAt
  };
  await documentRepository.save(pending);

  const blob = await getFileFromStorage(meta.id);
  if (!blob) {
    const failed: DocumentRecord = {
      ...pending,
      status: "failed",
      errorCode: "FILE_NOT_FOUND",
      errorMessage: "Blob file tidak ditemukan di IndexedDB.",
      updatedAt: nowISO()
    };
    await documentRepository.save(failed);
    return failed;
  }

  await documentRepository.update(meta.id, { status: "processing" });

  const result = await callProcessRoute(blob, meta, category);

  const record: DocumentRecord = {
    id: meta.id,
    category,
    status: toDocumentStatus(result.status),
    content: normalizeContent(result, category),
    confidence: result.confidence,
    provider: result.provider,
    processingTimeMs: result.processingTimeMs,
    processedAt: nowISO(),
    errorCode: result.errorCode,
    errorMessage: result.errorMessage,
    createdAt: pending.createdAt,
    updatedAt: nowISO()
  };

  await documentRepository.save(record);
  return record;
}
