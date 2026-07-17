import type { UploadedFileMeta } from "@/types";
import type { OCRProvider, OCRResult } from "../types";
import { isSupportedForOCR } from "../config";

const PROVIDER_NAME = "ocrspace";
const OCR_SPACE_ENDPOINT = "https://api.ocr.space/parse/image";
const OCR_TIMEOUT_MS = 30000;
const OCR_ENGINE = "2";

interface OcrSpaceParsedResult {
  ParsedText?: string;
  FileParseExitCode?: number | string;
  ErrorMessage?: string | string[];
  ErrorDetails?: string;
}

interface OcrSpaceResponse {
  ParsedResults?: OcrSpaceParsedResult[];
  OCRExitCode?: number | string;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  ErrorDetails?: string;
  ProcessingTimeInMilliseconds?: string | number;
}

function toOcrSpaceFileType(mimeType: string): string | undefined {
  switch (mimeType) {
    case "image/png":
      return "PNG";
    case "image/jpeg":
      return "JPG";
    case "application/pdf":
      return "PDF";
    default:
      return undefined;
  }
}

function joinErrorMessage(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string").join("; ") || undefined;
  return undefined;
}

function failure(errorCode: string, errorMessage: string, extra?: Partial<OCRResult>): OCRResult {
  return {
    success: false,
    extractedText: "",
    provider: PROVIDER_NAME,
    errorCode,
    errorMessage,
    ...extra
  };
}

async function callOcrSpace(file: Blob, meta: UploadedFileMeta, apiKey: string): Promise<OCRResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS);

  const formData = new FormData();
  formData.append("file", file, meta.filename);
  formData.append("OCREngine", OCR_ENGINE);
  formData.append("language", "auto");
  formData.append("scale", "true");
  const fileType = toOcrSpaceFileType(meta.mimeType);
  if (fileType) formData.append("filetype", fileType);

  let response: Response;
  try {
    response = await fetch(OCR_SPACE_ENDPOINT, {
      method: "POST",
      headers: { apikey: apiKey },
      body: formData,
      signal: controller.signal
    });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    return failure(
      isAbort ? "TIMEOUT" : "NETWORK_ERROR",
      isAbort
        ? `OCR.Space tidak merespons dalam ${OCR_TIMEOUT_MS / 1000} detik.`
        : error instanceof Error
          ? error.message
          : "Gagal menghubungi OCR.Space."
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const rawText = await response.text();
  let body: OcrSpaceResponse | null = null;
  try {
    body = rawText ? (JSON.parse(rawText) as OcrSpaceResponse) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    return failure(
      response.status === 429 ? "RATE_LIMITED" : "HTTP_ERROR",
      joinErrorMessage(body?.ErrorMessage) ?? `OCR.Space mengembalikan HTTP ${response.status} ${response.statusText}.`,
      { rawResponse: body ?? rawText }
    );
  }

  if (!body) {
    return failure("OCR_FAILED", "Respons OCR.Space tidak dapat dibaca (bukan JSON valid).", { rawResponse: rawText });
  }

  const exitCode = String(body.OCRExitCode);
  if (body.IsErroredOnProcessing || exitCode === "3" || exitCode === "4") {
    return failure(
      "OCR_FAILED",
      joinErrorMessage(body.ErrorMessage) ?? "OCR.Space gagal memproses file ini.",
      { rawResponse: body }
    );
  }

  const parsedResults = Array.isArray(body.ParsedResults) ? body.ParsedResults : [];
  const extractedText = parsedResults
    .map((result) => (typeof result.ParsedText === "string" ? result.ParsedText : ""))
    .join("\n")
    .trim();

  if (parsedResults.length === 0 || !extractedText) {
    return failure("EMPTY_RESULT", "OCR.Space tidak menemukan teks apa pun pada file ini.", {
      pageCount: parsedResults.length || undefined,
      rawResponse: body
    });
  }

  return {
    success: true,
    extractedText,
    provider: PROVIDER_NAME,
    pageCount: parsedResults.length,
    processingTimeMs: body.ProcessingTimeInMilliseconds !== undefined ? Number(body.ProcessingTimeInMilliseconds) : undefined,
    rawResponse: body
  };
}

export const ocrSpaceProvider: OCRProvider = {
  name: PROVIDER_NAME,
  async extractText(file, meta) {
    if (!isSupportedForOCR(meta.mimeType)) {
      return failure("UNSUPPORTED_FILE_TYPE", `Tipe file "${meta.mimeType}" tidak didukung OCR.Space di aplikasi ini.`);
    }

    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      return failure("MISSING_API_KEY", "OCR_SPACE_API_KEY belum diisi di .env.local.");
    }

    return callOcrSpace(file, meta, apiKey);
  }
};
