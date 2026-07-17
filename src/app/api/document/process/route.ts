import { NextResponse } from "next/server";
import type { DocumentCategory, UploadedFileMeta } from "@/types";
import { getDocumentProcessor } from "@/lib/document/getDocumentProcessor";

const KNOWN_CATEGORIES: DocumentCategory[] = ["image", "pdf", "document", "spreadsheet", "presentation"];

function isDocumentCategory(value: string): value is DocumentCategory {
  return (KNOWN_CATEGORIES as string[]).includes(value);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const metaRaw = formData.get("meta");
    const categoryRaw = formData.get("category");

    if (!(file instanceof Blob) || typeof metaRaw !== "string" || typeof categoryRaw !== "string") {
      return NextResponse.json({ message: "Payload tidak lengkap (file/meta/category)." }, { status: 400 });
    }

    if (!isDocumentCategory(categoryRaw)) {
      return NextResponse.json({ message: `Kategori "${categoryRaw}" tidak dikenali.` }, { status: 400 });
    }

    let meta: UploadedFileMeta;
    try {
      meta = JSON.parse(metaRaw) as UploadedFileMeta;
    } catch {
      return NextResponse.json({ message: "Metadata file tidak valid (bukan JSON)." }, { status: 400 });
    }

    const processor = getDocumentProcessor(categoryRaw);
    const result = await processor.process(file, meta);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Pemrosesan dokumen gagal. Silakan coba lagi." }, { status: 500 });
  }
}
