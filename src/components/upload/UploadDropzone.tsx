"use client";

import { useRef } from "react";
import { UploadCloud } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ACCEPTED_FILE_EXTENSIONS, MAX_FILE_SIZE_MB } from "@/lib/upload/config";
import { UploadFileList } from "./UploadFileList";

const formatChips = ["PNG", "JPG", "PDF", "DOCX", "XLSX", "CSV", "PPTX"];

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadedFiles, progressById, isDragging, handleDrop, handleDragOver, handleDragLeave, handleFileInputChange, removeFile, renameFile } = useFileUpload();

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        className={`focus-ring flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-6 py-12 text-center transition ${
          isDragging ? "scale-[1.01] border-primary-500 bg-primary-50" : "border-slate-200 bg-surface hover:border-primary-300 hover:bg-slate-50"
        }`}
      >
        <div className={`flex h-16 w-16 items-center justify-center rounded-3xl transition ${isDragging ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600"}`}>
          <UploadCloud className="h-8 w-8" />
        </div>
        <p className="mt-4 text-base font-black text-slate-900">
          {isDragging ? "Lepas untuk mengupload" : "Tarik file ke sini, atau klik untuk pilih"}
        </p>
        <p className="mt-1 text-sm text-slate-500">Gambar, PDF, Word, Spreadsheet, dan Presentasi — maks {MAX_FILE_SIZE_MB}MB per file</p>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {formatChips.map((chip) => (
            <span key={chip} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">{chip}</span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_EXTENSIONS.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      <UploadFileList files={uploadedFiles} progressById={progressById} onRemove={removeFile} onRename={renameFile} />
    </div>
  );
}
