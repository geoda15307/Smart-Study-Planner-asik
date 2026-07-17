import type { DocumentCategory } from "@/types";

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ALLOWED_FILE_TYPES: Record<DocumentCategory, { label: string; extensions: string[]; mimeTypes: string[] }> = {
  image: {
    label: "Gambar",
    extensions: [".png", ".jpg", ".jpeg"],
    mimeTypes: ["image/png", "image/jpeg"]
  },
  pdf: {
    label: "PDF",
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"]
  },
  document: {
    label: "Dokumen Word",
    extensions: [".doc", ".docx"],
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
  },
  spreadsheet: {
    label: "Spreadsheet",
    extensions: [".xlsx", ".xls", ".csv"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv"
    ]
  },
  presentation: {
    label: "Presentasi",
    extensions: [".ppt", ".pptx"],
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ]
  }
};

export const ACCEPTED_FILE_EXTENSIONS = Object.values(ALLOWED_FILE_TYPES).flatMap((entry) => entry.extensions);

export function detectUploadCategory(file: File): DocumentCategory | null {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  const entry = (Object.entries(ALLOWED_FILE_TYPES) as [DocumentCategory, (typeof ALLOWED_FILE_TYPES)[DocumentCategory]][])
    .find(([, config]) => config.extensions.includes(extension) || config.mimeTypes.includes(file.type));
  return entry ? entry[0] : null;
}

export function validateFile(file: File): { valid: true } | { valid: false; reason: string } {
  const category = detectUploadCategory(file);
  if (!category) {
    return { valid: false, reason: `Tipe file tidak didukung. Gunakan: ${ACCEPTED_FILE_EXTENSIONS.join(", ")}` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, reason: `Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB.` };
  }
  return { valid: true };
}
