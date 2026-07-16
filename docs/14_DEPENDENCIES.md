# Dependencies

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

Daftar lengkap ada di `package.json`. Dokumen ini menjelaskan **kenapa** dependency penting dipakai, bukan mendaftar ulang versi — untuk itu langsung cek `package.json`.

## Dependency inti (semua masih aktif dipakai)

| Package | Kenapa dipakai | Alternatif |
|---|---|---|
| `next` | Framework — App Router, routing, API routes | — |
| `react`, `react-dom` | Wajib untuk Next.js | — |
| `zustand` | State management. Dipilih kemungkinan karena API-nya minim boilerplate dibanding Redux, dan `persist` middleware bawaan pas untuk pola local-first project ini | Redux Toolkit, Jotai |
| `@supabase/ssr` + `@supabase/supabase-js` | Klien Supabase — **hanya** dipakai untuk Authentication (lihat [04_AUTHENTICATION](./04_AUTHENTICATION.md)), bukan untuk data aplikasi | — (kalau Supabase Auth diganti, ini bisa dilepas seluruhnya) |
| `idb` | Wrapper Promise di atas IndexedDB API native. Ditambahkan khusus untuk sistem upload — IndexedDB API native berbasis event/callback yang mudah salah kalau ditulis manual | Bisa hand-roll IndexedDB langsung (lebih rawan bug), atau `localforage` (lebih besar, fitur lebih dari yang dibutuhkan) |
| `lucide-react` | Library icon — dipakai `CategoryIcon` untuk resolusi icon dinamis dari string, dan komponen upload | `heroicons`, `react-icons` |
| `date-fns` | Semua manipulasi tanggal (`utils/date.ts`), termasuk locale Indonesia (`id`) | `dayjs`, `luxon` |
| `recharts` | Chart di halaman Progress (`ProgressCharts.tsx`) | `chart.js`, `visx` |
| `clsx`, `tailwind-merge` | Utility gabungan className kondisional — umum dipakai bersama Tailwind | — |

## Dev dependencies

| Package | Kenapa |
|---|---|
| `typescript` | Type-checking |
| `eslint`, `eslint-config-next` | Linting. **Catatan:** sempat tidak ada file `.eslintrc.json` sama sekali di awal project, jadi `next lint` tidak pernah benar-benar jalan sampai ditambahkan belakangan |
| `tailwindcss`, `postcss`, `autoprefixer` | Styling |
| `@types/*` | Definisi tipe untuk Node/React |

## Dependency yang TIDAK ada (sengaja, keputusan sadar)

Beberapa library yang mungkin terlihat "wajar" untuk fitur yang ada, tapi sengaja tidak ditambahkan:

- **`react-dropzone`** — drag & drop upload di-hand-roll pakai native browser Drag-and-Drop API + `<input type="file">`, bukan library. Konsisten dengan gaya project ini yang menjaga jumlah dependency tetap kecil.
- **`xlsx`/`papaparse`** — belum ditambahkan karena sistem upload saat ini hanya menyimpan file spreadsheet mentah, belum membaca isinya (parsing baru dibutuhkan saat OCR/document-processing dibangun — lihat [08_DOCUMENT_PIPELINE](./08_DOCUMENT_PIPELINE.md)).
- **SDK provider AI** (`openai`, `@anthropic-ai/sdk`, `@google/generative-ai`, dst.) — belum ditambahkan karena provider AI belum diaktifkan (lihat [16_ROADMAP](./16_ROADMAP.md)). Stub provider di `src/lib/ai/providers/` saat ini tidak butuh SDK apapun karena cuma melempar error.

## Versi Next.js — insiden yang perlu diketahui

Sempat ada percobaan upgrade ke **Next.js 16** yang tidak sengaja ter-commit sebagian (duplikat key `"next"` di `package.json`, lockfile ter-lock ke `16.2.10`, padahal React masih di versi 18 yang tidak kompatibel dengan Next 16). Ini sudah diperbaiki — project ini berjalan di **Next.js 14** (`^14.2.15`, ter-lock ke `14.2.35`). Kalau suatu saat memang ingin upgrade Next.js, itu harus jadi keputusan sadar dan direncanakan (termasuk upgrade React ke v19), bukan kebawa tidak sengaja lagi. Detail insiden: [17_TECH_DEBT](./17_TECH_DEBT.md) dan [18_CHANGELOG](./18_CHANGELOG.md).
