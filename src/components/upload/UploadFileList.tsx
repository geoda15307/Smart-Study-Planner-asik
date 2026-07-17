import { FolderOpen } from "lucide-react";
import type { UploadedFileMeta } from "@/types";
import { UploadFileItem } from "./UploadFileItem";

export function UploadFileList({
  files,
  progressById,
  onRemove,
  onRename
}: {
  files: UploadedFileMeta[];
  progressById: Record<string, number>;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  if (!files.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-surface text-slate-300 shadow-sm">
          <FolderOpen className="h-7 w-7" />
        </div>
        <p className="mt-4 text-sm font-black text-slate-700">Belum ada dokumen</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">
          Upload materi kuliahmu — teksnya diekstrak otomatis, lalu bisa langsung diringkas & dipelajari dengan AI.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{files.length} dokumen</p>
      {files.map((file) => (
        <UploadFileItem
          key={file.id}
          file={file}
          progress={progressById[file.id]}
          onRemove={() => onRemove(file.id)}
          onRename={(name) => onRename(file.id, name)}
        />
      ))}
    </div>
  );
}
