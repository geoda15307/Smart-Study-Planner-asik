"use client";

import { AppShell } from "@/components/layout/AppShell";
import { UploadDropzone } from "@/components/upload/UploadDropzone";

export default function UploadPage() {
  return (
    <AppShell title="Dokumen" subtitle="Upload materi kuliah — teksnya diekstrak otomatis, lalu ringkas & pelajari dengan AI.">
      <UploadDropzone />
    </AppShell>
  );
}
