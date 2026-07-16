# State Management

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

## Tiga lapis penyimpanan, satu aturan pembagian

Aplikasi ini pakai **tiga** mekanisme penyimpanan berbeda di sisi klien, masing-masing untuk jenis data yang cocok dengan karakteristiknya:

```
Zustand (in-memory, reaktif)
    │
    ├── persist middleware ──→ localStorage
    │       (semua state kecuali yang butuh binary besar)
    │
    └── (tidak menyimpan blob file — hanya metadata-nya)

IndexedDB (lewat lib/indexedDb.ts)
    │
    └── khusus untuk BLOB FILE yang diupload
        (gambar, PDF, spreadsheet — bisa besar, tidak cocok di localStorage)
```

## Zustand + localStorage — sumber kebenaran untuk hampir semua data

Satu store (`src/store/useAppStore.ts`), satu key localStorage (`smart-study-planner-store`). Menyimpan: user, tasks, categories, courses, schedules, preferences, widgets, achievements, chatMessages, **dan metadata file upload** (`uploadedFiles` — tapi bukan isi file-nya, lihat di bawah).

Kenapa localStorage cukup untuk ini: semuanya data JSON kecil-menengah (teks, angka, array pendek). `persist` middleware Zustand otomatis serialize seluruh state ke localStorage setiap ada perubahan — tidak ada `partialize` yang mengecualikan sebagian state.

Detail lengkap isi store: [12_STORES](./12_STORES.md).

## IndexedDB — khusus untuk blob file besar

localStorage punya batas ukuran total (~5-10MB, tergantung browser) dan hanya bisa menyimpan string — tidak cocok untuk file gambar/PDF/spreadsheet yang bisa berukuran beberapa MB. Karena itu, saat sistem upload dibangun (lihat [07_UPLOAD_SYSTEM](./07_UPLOAD_SYSTEM.md)), **isi file (blob)** disimpan terpisah di IndexedDB lewat wrapper `src/lib/indexedDb.ts`, sementara **metadata-nya saja** (nama file, ukuran, tipe, status, tanggal) yang masuk ke Zustand/localStorage.

Kedua bagian ini dihubungkan lewat `id` yang sama:

```
useAppStore.uploadedFiles[]        IndexedDB "files" object store
┌─────────────────────────┐        ┌──────────────────────┐
│ id: "file_abc123"       │◄──────►│ key: "file_abc123"   │
│ filename: "materi.pdf"  │        │ value: Blob(2.3 MB)  │
│ status: "ready"         │        └──────────────────────┘
└─────────────────────────┘
     (localStorage)                     (IndexedDB)
```

Kenapa dipisah begini, bukan progress upload disimpan di Zustand juga: progress upload berubah sangat cepat (banyak event per detik saat membaca file besar) — kalau ikut masuk `persist` Zustand, itu berarti serialize+tulis seluruh state ke localStorage berkali-kali per detik, boros. Karena itu progress upload sengaja **hanya** state lokal di dalam hook `useFileUpload`, tidak pernah masuk store.

## Hubungan ketiganya, ringkas

| | Zustand (memory) | localStorage | IndexedDB |
|---|---|---|---|
| Dikelola lewat | Store langsung | Otomatis oleh `persist` middleware | Manual lewat `lib/indexedDb.ts` |
| Isi | Semua state aplikasi | Salinan serialize dari Zustand | Blob file saja |
| Bertahan setelah refresh? | Tidak (di-re-hydrate dari localStorage) | Ya | Ya |
| Dipakai untuk progress upload? | Tidak — cuma state lokal hook | Tidak | Tidak (blob ditulis setelah selesai dibaca) |

## Hydration — kenapa ada "Memeriksa sesi login..."

Zustand `persist` membaca localStorage secara **asynchronous** saat aplikasi pertama kali dimuat (butuh untuk menghindari mismatch server/client render di Next.js). Selama proses ini belum selesai (`persist.hasHydrated()` masih `false`), `AppShell` menampilkan layar loading — ini yang menjelaskan kenapa ada jeda singkat "Memeriksa sesi login..." di setiap pembukaan aplikasi.
