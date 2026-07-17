import type { DocumentRecord } from "@/types";

// DocumentProcessor pindah ke src/lib/document/types.ts — processor (imageProcessor)
// sekarang memanggil OCR yang butuh API key, jadi harus server-only. DocumentRepository
// tetap di sini karena berbasis IndexedDB (browser-only, tidak bisa jalan di server sama
// sekali). Lihat docs/SPRINT_1_ARCHITECTURE_FREEZE.md.

export interface DocumentRepository {
  save(record: DocumentRecord): Promise<void>;
  update(id: string, updates: Partial<DocumentRecord>): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<DocumentRecord | undefined>;
  findAll(): Promise<DocumentRecord[]>;
  exists(id: string): Promise<boolean>;
}
