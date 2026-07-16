# Upload System

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

Status: **✅ Selesai dan berjalan.** Ini adalah langkah pertama dari [08_DOCUMENT_PIPELINE](./08_DOCUMENT_PIPELINE.md) — bagian OCR/AI Summary setelahnya belum dibuat.

## Kebijakan penyimpanan

**Bukan Supabase Storage.** Sesuai batasan di [04_AUTHENTICATION](./04_AUTHENTICATION.md) (Supabase hanya untuk auth), file yang diupload disimpan **sepenuhnya lokal**:

- **Isi file (blob)** → IndexedDB, lewat `src/lib/indexedDb.ts`
- **Metadata file** (nama, ukuran, tipe, status) → Zustand/localStorage, lewat `useAppStore().uploadedFiles`

Detail hubungan keduanya: [06_STATE_MANAGEMENT](./06_STATE_MANAGEMENT.md).

## Tipe file yang didukung

| Kategori | Ekstensi | MIME type |
|---|---|---|
| Gambar | `.png`, `.jpg`, `.jpeg` | `image/png`, `image/jpeg` |
| Dokumen | `.pdf` | `application/pdf` |
| Spreadsheet | `.xlsx`, `.xls`, `.csv` | Office/Excel MIME types, `text/csv` |

Dikonfigurasi di `src/lib/upload/config.ts` — **satu tempat** untuk mengubah tipe yang diizinkan atau ukuran maksimal (default 10MB), sesuai permintaan agar mudah diubah tanpa menyentuh banyak file.

## Alur upload

```
Pengguna drag file / klik dropzone
        ↓
useFileUpload hook: validateFile() dari lib/upload/config.ts
        ↓
   Valid? ──No──→ tampilkan status "error" + alasan di UI (file tetap muncul di list)
        │
       Yes
        ↓
Tambahkan ke store dengan status "uploading"
        ↓
FileReader baca file (onprogress → update progress LOKAL, bukan ke store)
        ↓
storageService.saveFileToStorage() → lib/indexedDb.ts → tulis blob ke IndexedDB
        ↓
Update store: status "ready"
        ↓
UploadFileItem fetch ulang blob dari IndexedDB → buat object URL → tampilkan preview (khusus gambar)
```

## Fitur yang sudah ada (checklist)

- ✅ Drag & drop
- ✅ Click to upload (input file tersembunyi)
- ✅ Multiple file sekaligus
- ✅ Progress upload — **progress nyata** dari `FileReader.onprogress`, bukan animasi buatan
- ✅ Preview gambar — fetch blob dari IndexedDB, buat `URL.createObjectURL`
- ✅ Validasi file (tipe + ukuran), pesan error jelas per file
- ✅ Ukuran maksimal mudah diubah (satu konstanta di `lib/upload/config.ts`)
- ✅ Hapus file — membersihkan **baik** metadata di store **maupun** blob di IndexedDB (tidak meninggalkan sampah)

## Komponen & file terkait

| File | Peran |
|---|---|
| `src/lib/indexedDb.ts` | Wrapper generik IndexedDB (put/get/delete/list blob) |
| `src/lib/upload/config.ts` | Konfigurasi ukuran maksimal + tipe file yang diizinkan, fungsi `validateFile`/`detectUploadCategory` |
| `src/services/storage/storageService.ts` | `saveFileToStorage`/`getFileFromStorage`/`deleteFileFromStorage`/`listStoredFileIds` |
| `src/store/useAppStore.ts` | State `uploadedFiles` + action terkait |
| `src/hooks/useFileUpload.ts` | Logika drag&drop, validasi, baca file, progress |
| `src/components/upload/UploadDropzone.tsx` | Area drag&drop + input file |
| `src/components/upload/UploadFileList.tsx` | Daftar file |
| `src/components/upload/UploadFileItem.tsx` | Satu baris file: preview, progress bar, status, tombol hapus |
| `src/app/upload/page.tsx` | Halaman "Dokumen" (nav sidebar) |

## Yang BELUM ada (sengaja)

Sistem ini berhenti tepat setelah file tersimpan. **Tidak ada** ekstraksi teks/OCR, **tidak ada** ringkasan AI — itu tahap selanjutnya, didesain (bukan diimplementasikan) di [08_DOCUMENT_PIPELINE](./08_DOCUMENT_PIPELINE.md).
