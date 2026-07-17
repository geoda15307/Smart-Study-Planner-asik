import type { DocumentRecord } from "@/types";
import { deleteDocument, getAllDocuments, getDocument, putDocument } from "@/lib/indexedDb";
import { nowISO } from "@/utils/date";
import type { DocumentRepository } from "./types";

export class IndexedDbDocumentRepository implements DocumentRepository {
  async save(record: DocumentRecord): Promise<void> {
    await putDocument(record);
  }

  async update(id: string, updates: Partial<DocumentRecord>): Promise<void> {
    const existing = await getDocument(id);
    if (!existing) {
      throw new Error(`DocumentRecord dengan id "${id}" tidak ditemukan.`);
    }
    await putDocument({ ...existing, ...updates, id, updatedAt: nowISO() });
  }

  async delete(id: string): Promise<void> {
    await deleteDocument(id);
  }

  async findById(id: string): Promise<DocumentRecord | undefined> {
    return getDocument(id);
  }

  async findAll(): Promise<DocumentRecord[]> {
    return getAllDocuments();
  }

  async exists(id: string): Promise<boolean> {
    const record = await getDocument(id);
    return record !== undefined;
  }
}

export const documentRepository = new IndexedDbDocumentRepository();
