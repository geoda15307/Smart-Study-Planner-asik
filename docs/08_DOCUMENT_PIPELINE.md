# Document Pipeline

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

Dokumen ini menjelaskan alur lengkap "dari file diupload sampai jadi ringkasan belajar" — sebagian **sudah berjalan**, sebagian **baru desain**. Batasnya ditandai jelas di bawah.

## Pipeline saat ini vs yang direncanakan

```
Upload                     ✅ SELESAI — lihat 07_UPLOAD_SYSTEM.md
   ↓
Validation                 ✅ SELESAI — tipe file + ukuran, di lib/upload/config.ts
   ↓
Detect File (kategori)     ✅ SELESAI — detectUploadCategory() menentukan image/document/spreadsheet
   ↓
Processor                  ❌ FUTURE DEVELOPMENT
   ↓
Extract Content (OCR)      ❌ FUTURE DEVELOPMENT
   ↓
Save Document              ⚠️ SEBAGIAN — file blob + metadata sudah tersimpan (lihat 07_UPLOAD_SYSTEM.md),
                               tapi belum ada konsep "Document" hasil ekstraksi terpisah dari file mentah
   ↓
AI Summary                 ❌ FUTURE DEVELOPMENT
   ↓
Task Recommendation        ❌ FUTURE DEVELOPMENT
   ↓
Calendar Recommendation    ❌ FUTURE DEVELOPMENT
   ↓
Flashcard (opsional)       ❌ FUTURE DEVELOPMENT
   ↓
Quiz (opsional)            ❌ FUTURE DEVELOPMENT
```

## Yang sudah berjalan hari ini

File yang diupload tersimpan lokal (IndexedDB untuk blob + Zustand untuk metadata), lengkap dengan validasi tipe/ukuran dan deteksi kategori otomatis (gambar/dokumen/spreadsheet). Berhenti di situ — tidak ada isi file yang "dibaca" oleh sistem.

## Future Development: OCR

**Belum diimplementasikan.** Yang sudah ada baru **interface/abstraksi** di `src/services/ocr/types.ts`:

```ts
interface OCRProvider {
  name: string;
  extractText(file: Blob, meta: UploadedFileMeta): Promise<OCRResult>;
}
```

Tujuannya: supaya nanti provider OCR sungguhan (atau vision-capable LLM) bisa "dicolokkan" tanpa mengubah UI upload sama sekali — komponen upload tidak tahu dan tidak perlu tahu provider OCR apa yang dipakai di baliknya. Tidak ada implementasi provider apapun untuk interface ini saat ini.

## Future Development: AI Summary

**Belum diimplementasikan.** Abstraksi provider AI (`src/lib/ai/types.ts`) sudah punya method untuk ini:

```ts
summarizeDocument(input: { text?: string; imageBlob?: Blob }): Promise<DocumentSummary>
```

`DocumentSummary` sudah didesain mengikuti struktur output yang diinginkan:

```ts
interface DocumentSummary {
  title: string;
  summary: string;
  keyPoints: string[];
  formulas?: string[];
  recommendedSchedule?: string[];
  flashcards?: { question: string; answer: string }[];
  quiz?: { question: string; options: string[]; correctIndex: number }[];
}
```

Tidak ada provider yang benar-benar mengisi tipe ini hari ini — semua provider (`openai`, `anthropic`, `gemini`, `openrouter`) masih berupa stub yang melempar error "belum dikonfigurasi". Detail abstraksi provider: [11_SERVICES](./11_SERVICES.md). Rekomendasi provider mana yang cocok: [16_ROADMAP](./16_ROADMAP.md).

## Kenapa didesain sekarang meski belum dipakai

Supaya saat provider AI/OCR sungguhan siap diaktifkan nanti, pekerjaannya **hanya** mengisi implementasi di balik interface yang sudah ada — bukan merombak sistem upload atau menulis ulang kontrak antar modul. Ini yang dimaksud "arsitektur modular" di seluruh dokumen ini: setiap lapis (upload → OCR → AI Summary) bisa berubah/diganti tanpa lapis lain ikut berubah.
