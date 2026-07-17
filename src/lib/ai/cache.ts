import type { AISummary } from "@/types";

// Kunci & validasi cache AI (AI_ARCHITECTURE_FREEZE §9, diperluas). Pure + tanpa network —
// hashing memakai Web Crypto (`crypto.subtle`) yang tersedia native di browser maupun runtime
// server, tanpa dependency baru. Dihitung di client (documentSummaryService) supaya cache-hit
// tidak butuh round-trip network sama sekali.
//
// Sejak audit Juli 2026: validitas cache JUGA mensyaratkan provider+model record cocok dengan
// provider+model yang AKTIF sekarang. Efeknya: ganti AI_PROVIDER (mock↔gemini) atau GEMINI_MODEL
// otomatis membuat cache lama invalid → regenerasi, tidak pernah menampilkan hasil dari provider
// lain. Tidak mengubah kontrak API — murni logika keandalan cache di client.

// normalize(): rapikan whitespace berlebih sebelum hash, supaya teks yang isinya sama tapi
// beda spasi/baris tidak menghasilkan hash berbeda (§9.1).
export function normalizeForHash(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// SHA-256(normalize(text)) — komponen kunci cache untuk AISummary (§9.1).
export function computeSourceTextHash(text: string): Promise<string> {
  return sha256Hex(normalizeForHash(text));
}

// --- Signature provider+model aktif ---------------------------------------------------------
// Client tidak bisa membaca AI_PROVIDER/GEMINI_MODEL (server-only). Env publik NEXT_PUBLIC_AI_*
// mencerminkannya supaya client tahu "record ini dari setup yang sama atau bukan". WAJIB
// di-set sinkron dengan AI_PROVIDER/GEMINI_MODEL (lihat .env.example). Nilai ini harus SAMA
// PERSIS dengan yang di-stamp provider ke record: mock → provider "mock"/model "mock",
// gemini → provider "gemini"/model = GEMINI_MODEL.
export interface AIActiveSignature {
  provider: string;
  model: string;
}

export function getActiveAISignature(): AIActiveSignature {
  return {
    provider: process.env.NEXT_PUBLIC_AI_PROVIDER ?? "mock",
    model: process.env.NEXT_PUBLIC_AI_MODEL ?? "mock"
  };
}

// Apakah record (Summary/Flashcard/Quiz/Recommendation) berasal dari provider+model aktif?
// Dipakai komponen untuk TIDAK menampilkan hasil provider lama saat panel dibuka.
export function matchesActiveSignature(record: { provider: string; model: string }, signature: AIActiveSignature = getActiveAISignature()): boolean {
  return record.provider === signature.provider && record.model === signature.model;
}

// --- Validitas cache -------------------------------------------------------------------------

// AISummary valid HANYA kalau documentId (implisit — key store), sourceTextHash, promptVersion,
// DAN provider+model aktif cocok semuanya (§9.1 + audit Juli 2026). documentId sudah tercakup
// lewat getSummary(documentId). Type guard supaya pemanggil langsung dapat AISummary saat valid.
export function isSummaryCacheValid(
  cached: AISummary | undefined,
  sourceTextHash: string,
  promptVersion: string,
  signature: AIActiveSignature = getActiveAISignature()
): cached is AISummary {
  return (
    cached !== undefined &&
    cached.sourceTextHash === sourceTextHash &&
    cached.promptVersion === promptVersion &&
    matchesActiveSignature(cached, signature)
  );
}

// Fitur turunan (Flashcard/Quiz/Recommendation) tidak menyimpan sourceTextHash sendiri —
// validitasnya transitif lewat summaryId: cocok dengan AISummary aktif yang SUDAH tervalidasi
// terhadap hash+promptVersion+signature lebih dulu (§9.1). Ditambah cek provider+model sendiri
// sebagai pertahanan-berlapis. Kalau AISummary aktif belum ada (activeSummaryId undefined),
// turunannya otomatis dianggap tidak valid. Type guard generik supaya pemanggil langsung dapat
// record yang menyempit tipenya (bukan `| undefined`) saat valid.
export function isDerivedCacheValid<T extends { summaryId: string; provider: string; model: string }>(
  cached: T | undefined,
  activeSummaryId: string | undefined,
  signature: AIActiveSignature = getActiveAISignature()
): cached is T {
  return (
    cached !== undefined &&
    activeSummaryId !== undefined &&
    cached.summaryId === activeSummaryId &&
    matchesActiveSignature(cached, signature)
  );
}
