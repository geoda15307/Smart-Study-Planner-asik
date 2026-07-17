"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, Download, FileSpreadsheet, FileText, Image as ImageIcon, Loader2, Pencil, Presentation, Trash2 } from "lucide-react";
import type { DocumentStatus, UploadedFileMeta } from "@/types";
import { downloadStoredFile, getFileFromStorage } from "@/services/storage/storageService";
import { ALLOWED_FILE_TYPES } from "@/lib/upload/config";
import { useAppStore } from "@/store/useAppStore";
import { AIDocumentPanel } from "@/components/ai/AIDocumentPanel";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

const categoryIcon = {
  image: ImageIcon,
  pdf: FileText,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation
};

// Badge status pemrosesan dokumen (bukan status upload). "Belum didukung" untuk NOT_IMPLEMENTED
// dibedakan dari kegagalan sungguhan (netral, bukan merah).
function documentBadge(status: DocumentStatus, isNotImplemented: boolean): { label: string; className: string } {
  if (isNotImplemented) return { label: "Belum didukung", className: "bg-slate-100 text-slate-500" };
  const map: Record<DocumentStatus, { label: string; className: string }> = {
    pending: { label: "Menunggu", className: "bg-slate-100 text-slate-500" },
    processing: { label: "Memproses", className: "bg-amber-50 text-amber-600" },
    extracted: { label: "Teks terekstrak", className: "bg-emerald-50 text-emerald-600" },
    needs_ocr: { label: "Perlu OCR", className: "bg-amber-50 text-amber-600" },
    completed: { label: "Siap", className: "bg-emerald-50 text-emerald-600" },
    failed: { label: "Gagal", className: "bg-red-50 text-red-600" }
  };
  return map[status];
}

export function UploadFileItem({
  file,
  progress,
  onRemove,
  onRename
}: {
  file: UploadedFileMeta;
  progress?: number;
  onRemove: () => void;
  onRename: (name: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(file.filename);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const record = useAppStore((state) => state.documents[file.id]);
  const Icon = categoryIcon[file.category];
  const canUseAI = file.status === "ready" && record?.status === "completed" && Boolean(record.content?.text);
  const isNotImplemented = record?.status === "failed" && record.errorCode === "NOT_IMPLEMENTED";

  useEffect(() => {
    if (file.category !== "image" || file.status !== "ready") return;
    let objectUrl: string | null = null;
    getFileFromStorage(file.id).then((blob) => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      }
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.id, file.category, file.status]);

  useEffect(() => {
    if (renaming) renameInputRef.current?.select();
  }, [renaming]);

  function commitRename() {
    setRenaming(false);
    if (nameDraft.trim() && nameDraft.trim() !== file.filename) onRename(nameDraft);
    else setNameDraft(file.filename);
  }

  const badge = record ? documentBadge(record.status, isNotImplemented) : null;
  const metaParts = [
    formatFileSize(file.size),
    ALLOWED_FILE_TYPES[file.category].label,
    record?.content?.pageCount ? `${record.content.pageCount} hal` : null,
    formatDate(file.createdAt)
  ].filter(Boolean);

  return (
    <div className="animate-fade-up rounded-card border border-slate-100 bg-surface p-4 shadow-soft transition hover:border-slate-200">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- dynamic client-only blob: URL, next/image can't fetch this
            <img src={previewUrl} alt={file.filename} className="h-full w-full object-cover" />
          ) : (
            <Icon className="h-6 w-6 text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {renaming ? (
            <input
              ref={renameInputRef}
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitRename();
                if (event.key === "Escape") {
                  setNameDraft(file.filename);
                  setRenaming(false);
                }
              }}
              className="w-full rounded-lg border border-primary-300 bg-surface px-2 py-1 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          ) : (
            <p className="truncate text-sm font-bold text-slate-900">{file.filename}</p>
          )}

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            {metaParts.map((part, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 ? <span className="text-slate-300">·</span> : null}
                {part}
              </span>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {file.status === "uploading" ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengupload {progress ?? 0}%
              </span>
            ) : null}
            {file.status === "error" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                <CircleAlert className="h-3.5 w-3.5" /> {file.errorMessage ?? "Gagal"}
              </span>
            ) : null}
            {file.status === "ready" && badge ? (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.className}`}>{badge.label}</span>
            ) : null}
          </div>

          {file.status === "uploading" ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${progress ?? 0}%` }} />
            </div>
          ) : null}
        </div>

        {file.status === "ready" ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => downloadStoredFile(file.id, file.filename)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Unduh file"
              title="Unduh"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setRenaming(true)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Ganti nama file"
              title="Ganti nama"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Hapus ${file.filename}`}
              title="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Hapus ${file.filename}`}
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {record?.status === "failed" && !isNotImplemented ? (
        <p className="mt-2 rounded-xl bg-red-50 p-2 text-xs font-bold text-red-600">Ekstraksi gagal: {record.errorMessage}</p>
      ) : null}
      {isNotImplemented ? (
        <p className="mt-2 rounded-xl bg-slate-50 p-2 text-xs text-slate-500">{record?.errorMessage}</p>
      ) : null}

      {record?.content?.text ? (
        <details className="mt-2 group">
          <summary className="cursor-pointer list-none text-xs font-bold text-slate-500 transition hover:text-slate-700">
            <span className="inline-block transition group-open:rotate-90">▸</span> Lihat teks ekstraksi
          </summary>
          <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            {record.content.text}
          </p>
        </details>
      ) : null}

      {canUseAI ? <AIDocumentPanel documentId={file.id} filename={file.filename} /> : null}
    </div>
  );
}
