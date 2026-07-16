# Services

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

`src/services/` = logika bisnis yang bicara ke "dunia luar" (network, browser storage API) atas nama fitur tertentu. Beda dengan `src/lib/` (klien/infrastruktur tingkat rendah tanpa pengetahuan domain) — lihat [02_FOLDER_STRUCTURE](./02_FOLDER_STRUCTURE.md) untuk perbandingan langsungnya.

## `services/auth/authService.ts` — satu-satunya pintu ke Supabase Auth

**Tanggung jawab:** `login`, `register`, `logout`. Tidak lebih — sesuai batasan Supabase-hanya-untuk-auth ([04_AUTHENTICATION](./04_AUTHENTICATION.md)). Memakai `lib/supabase/client.ts` untuk komunikasi sebenarnya, plus menerjemahkan pesan error Supabase (bahasa Inggris) ke Bahasa Indonesia untuk kasus umum.

**Hubungan:** dipanggil dari `src/app/auth/login/page.tsx` dan `src/app/auth/register/page.tsx`. Hasil sukses diteruskan ke `useAppStore().authenticate()` untuk mengisi state Zustand.

## `services/storage/storageService.ts` — dua tanggung jawab berbeda dalam satu file

File ini punya dua kelompok fungsi yang **tidak saling bergantung**, cuma kebetulan berada di file yang sama karena sama-sama "urusan storage":

1. **Export (lama):** `downloadJSON`, `downloadCSV` — generate `Blob` lalu trigger download lewat `<a download>`. Dipakai di halaman Settings untuk backup data.
2. **File upload (baru):** `saveFileToStorage`, `getFileFromStorage`, `deleteFileFromStorage`, `listStoredFileIds` — wrapper tipis di atas `lib/indexedDb.ts`. Dipakai oleh `useFileUpload` hook.

Kalau file ini terus bertambah fungsi yang tidak berhubungan, pertimbangkan dipecah jadi `exportService.ts` dan `fileStorageService.ts` — belum dilakukan karena ukurannya masih kecil.

## `services/ai/aiService.ts` — client tipis ke API route

Cuma dua fungsi (`analyzeTask`, `askAI`), masing-masing `fetch` ke `/api/ai/analyze` dan `/api/ai/chat` (lihat [09_API](./09_API.md)). Tidak ada logika AI di sini sama sekali — semuanya di server (route handler). File ini murni jembatan network dari komponen ke API.

## `services/ocr/types.ts` — baru interface

**Belum ada implementasi apapun.** Isinya cuma kontrak (`OCRProvider`, `OCRResult`) untuk dipakai nanti. Lihat [08_DOCUMENT_PIPELINE](./08_DOCUMENT_PIPELINE.md).

## Abstraksi AI Provider — kenapa di `lib/`, bukan `services/`

`src/lib/ai/` (`types.ts`, `getAIProvider.ts`, `providers/*.ts`) sengaja **tidak** ditaruh di `services/` meskipun secara konsep mirip "layanan AI". Alasannya: kode ini **harus** jalan di server (Route Handler), tidak boleh pernah diimpor oleh kode client-side, karena akan memuat API key provider AI (`OPENAI_API_KEY`, dst.) yang tidak boleh sampai ke browser. Menaruhnya di `lib/` (yang secara konvensi project ini dipahami sebagai "infrastruktur tingkat rendah") membantu mengingatkan batasan ini. Detail keamanan: [15_SECURITY](./15_SECURITY.md).

**Isi abstraksi ini:**

- `types.ts` — interface `AIProvider` (method `analyzeTask`, `chat`, `summarizeDocument`), sengaja dirancang cocok dengan kontrak route `/api/ai/analyze` dan `/api/ai/chat` yang sudah ada.
- `getAIProvider.ts` — factory, baca env var `AI_PROVIDER`, pilih implementasi.
- `providers/mock.ts` — satu-satunya provider yang **benar-benar berfungsi** (balasan placeholder sederhana), default saat ini.
- `providers/{openai,anthropic,gemini,openrouter}.ts` — stub, melempar error jelas ("belum dikonfigurasi") kalau dipanggil. Belum ada logika pemanggilan API sungguhan.

**Penting:** factory ini **belum dipanggil** oleh route `/api/ai/*` yang hidup — route itu masih 100% rule-based seperti sebelumnya (dikonfirmasi tidak berubah perilakunya). Abstraksi ini murni persiapan, bukan pengganti aktif.
