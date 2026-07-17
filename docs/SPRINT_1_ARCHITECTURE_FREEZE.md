# Sprint 1 — Architecture Freeze

Status: **DIIMPLEMENTASIKAN — Sprint 1–3 selesai & terverifikasi.** Dipertahankan sebagai catatan kontrak + amandemen; beberapa detail rencana awal yang dikoreksi saat implementasi ditandai dengan catatan audit Juli 2026 di §4/§7/§8.

Dokumen ini adalah **kontrak implementasi** untuk Sprint 1 (Document Processing Pipeline). Begitu disetujui, seluruh implementasi Sprint 1 wajib mengikuti dokumen ini. Perubahan arsitektur di tengah implementasi (rename, ubah shape interface, ubah storage strategy, dll.) berarti dokumen ini harus direvisi dan disetujui ulang dulu — bukan diubah diam-diam di kode.

Dokumen ini merangkum seluruh keputusan dari tahap Repository Audit, Documentation Review, Architecture Review, dan Design Review sebelumnya, dan menutup dua ambiguitas kecil yang baru terlihat saat disusun jadi kontrak (lihat catatan di §4 dan §5).

---

## Amandemen — OCR End-to-End (Sprint 3)

Begitu `imageProcessor` benar-benar memanggil OCR.Space (butuh `OCR_SPACE_API_KEY`), muncul kendala arsitektur yang belum terpikirkan saat freeze awal: **processor yang memanggil provider ber-API-key tidak boleh pernah berjalan di client** (aturan yang sama yang sudah menempatkan `lib/ai/*` dan `lib/ocr/*` sebagai server-only — lihat `docs/11_SERVICES.md`). `documentService`/`useFileUpload` (hook client) sebelumnya diasumsikan bisa memanggil `DocumentProcessor.process()` langsung — itu tidak mungkin aman begitu processor-nya memanggil OCR sungguhan. Koreksi yang diterapkan (detail lengkap di §"OCR Pipeline" di bagian bawah dokumen ini):

1. `DocumentProcessor` interface + `getDocumentProcessor.ts` + seluruh `processors/*` **pindah dari `services/document/` ke `lib/document/`** — persis alasan yang sama dengan pemindahan `services/ocr/` → `lib/ocr/` sebelumnya. `services/document/` sekarang hanya berisi `DocumentRepository`/`documentRepository.ts` (IndexedDB, wajib client-only, tidak mungkin jalan di server) dan `documentService.ts` (orchestrator client, tidak pernah mengimpor `lib/document/*`).
2. **Route server baru** `POST /api/document/process` — satu-satunya tempat `getDocumentProcessor()` dipanggil. `documentService.ts` (client) mengirim blob via `fetch`/`FormData` ke route ini, menerima `ProcessorResult` JSON kembali — pola identik `services/ai/aiService.ts` → `/api/ai/*`.
3. `DocumentRecord`/`ProcessorResult`/`ProcessingResult` diperluas (additive) dengan `confidence?`, `provider?`, `processingTimeMs?`, dan `processedAt?` (khusus `DocumentRecord`) — §4 lama tidak punya tempat untuk provenance hasil OCR.
4. Status sukses OCR pada `DocumentRecord.status` adalah **`completed`** (bukan `extracted`) — `extracted` tetap ada di tipe sebagai outcome intermediate processor, tapi `documentService` langsung memetakannya ke `completed` di level `DocumentRecord`.
5. `needs_ocr` sebagai hasil `imageProcessor` **sudah tidak dipakai lagi** sejak OCR benar-benar tersambung — OCR sekarang terjadi *di dalam* pemanggilan processor (lewat route), bukan tahap terpisah setelahnya. Nilai `needs_ocr` tetap direservasi di tipe untuk kasus lain di masa depan (mis. `pdfProcessor` mendeteksi PDF hasil scan).

§3 dan §6 di bawah sudah diperbarui mengikuti koreksi ini; §2 (diagram awal) dan beberapa detail di §7/§9 masih mencerminkan rencana sebelum koreksi — dibiarkan sebagai catatan sejarah keputusan, bukan referensi struktur final (rujuk §3 dan bagian "OCR Pipeline" di akhir dokumen untuk struktur final).

---

## Amandemen 2 — Local Parser (Sprint 2)

4 dari 5 processor stub (`pdfProcessor`, `documentFileProcessor`, `spreadsheetProcessor`, `presentationProcessor`) sekarang berisi implementasi nyata (`pdf-parse`, `mammoth`/`word-extractor`, `xlsx`, `jszip`+`fast-xml-parser`) — lihat `docs/08_DOCUMENT_PIPELINE.md` bagian "Local Parser" dan `docs/14_DEPENDENCIES.md` untuk detail tiap library. Perubahan struktural tambahan di luar yang sudah dicatat di Amandemen 1:

1. **`UploadCategory` (3 nilai lama) resmi disatukan penuh ke `DocumentCategory` (5 nilai)** — sebelumnya sengaja dipisah (lihat §4 asli) sampai upload sistem butuh menerima `.doc`/`.docx`/`.ppt`/`.pptx`. `ALLOWED_FILE_TYPES` di `lib/upload/config.ts` sekarang punya 5 entry. Migrasi data lama (`"document"` → `"pdf"`) dijalankan lewat `persist` middleware Zustand (`version: 1`, fungsi `migrate()`, backup mentah ke `localStorage["smart-study-planner-store__backup_v0"]`) — realisasi penuh dari rencana migrasi di §8.
2. **`documentService.ts` tidak lagi butuh fungsi jembatan kategori** (`toDocumentCategory()` yang disebut di §13 versi sebelumnya sudah dihapus) — `meta.category` sekarang sudah langsung bertipe `DocumentCategory`.
3. **`next.config.mjs` butuh `experimental.serverComponentsExternalPackages`** untuk `pdf-parse`/`@napi-rs/canvas` — tanpa ini, `pdf-parse` gagal dievaluasi di bundel webpack RSC dengan cara yang menjatuhkan **seluruh** route `/api/document/process` (bukan cuma kategori PDF), karena `getDocumentProcessor.ts` mengimpor semua processor secara statis di satu factory. Ditemukan lewat pengujian browser sungguhan, bukan type-check (type-check dan test Node terisolasi tidak menangkap ini karena keduanya tidak melewati pipeline bundling RSC Next.js).
4. **NOT_IMPLEMENTED dibedakan visual dari kegagalan sungguhan** di `UploadFileItem.tsx` — badge netral ("Belum didukung") bukan merah ("Gagal"), supaya format yang memang belum/tidak didukung tidak terlihat seperti bug.

---

## 1. Sprint Scope

**Termasuk Sprint 1:**
- `DocumentProcessor` interface (Strategy contract)
- 5 processor stub: Image, PDF, Document (Word), Spreadsheet, Presentation
- `DocumentProcessorFactory` (Strategy selector)
- Domain model: `DocumentCategory`, `DocumentStatus`, `ProcessorResult`, `ProcessingResult`, `DocumentRecord`
- IndexedDB store `documents` (Single Source of Truth untuk Document Record)
- `documentRepository` (akses IndexedDB terstruktur)
- `documentService` (orchestrator pipeline)
- Integrasi otomatis ke alur upload yang sudah ada
- Migrasi `UploadCategory` (3 nilai) → `DocumentCategory` (5 nilai), termasuk migrasi data persisted lama
- Zustand: mirror state non-persisted untuk UI (bukan penyimpanan Document Record)

**Belum termasuk Sprint 1** (direservasi di tipe, tidak diimplementasikan saat freeze ini ditulis — status terkini ada di Amandemen 1 & 2 di atas):
- ✅ ~~OCR sungguhan~~ — selesai Sprint 3, lihat Amandemen 1 & §13
- ✅ ~~Parser lokal sungguhan (pdf-parse, mammoth, xlsx, parser pptx kustom)~~ — selesai Sprint 2, lihat Amandemen 2
- ❌ Gemini/AI provider sungguhan
- ❌ AI Summary
- ❌ Flashcard Generator
- ❌ Quiz Generator
- ❌ Task Recommendation
- ❌ Calendar Recommendation
- ❌ Document Lifecycle policy (Keep Original/Balanced/Storage Saver) — field direservasi, logika belum ada

---

## 2. Final Architecture

```
Upload
  ↓
Validate
  ↓
Detect File Type            (DocumentCategory: image | pdf | document | spreadsheet | presentation)
  ↓
DocumentProcessorFactory     (pilih strategy berdasarkan category)
  ↓
DocumentProcessor            (strategy konkret: Image/Pdf/Document/Spreadsheet/Presentation)
  ↓
ProcessorResult              (output mentah, per-kategori, belum seragam)
  ↓
Normalize                    (ubah ProcessorResult → ProcessingResult, shape seragam)
  ↓
DocumentRecord                (entity final, digabung dengan status pipeline)
  ↓
IndexedDB (`documents` store) — Single Source of Truth
  ↓
Zustand UI Mirror             (non-persisted, untuk reaktivitas komponen)
```

---

## 3. Folder Structure

**(Diperbarui pasca-Amandemen OCR — lihat catatan di atas. Versi asli menaruh seluruh `document/` di `services/`; itu tidak lagi akurat.)**

```
src/
  services/
    document/
      documentService.ts        # orchestrator CLIENT: pending → blob → fetch /api/document/process → save
      documentRepository.ts     # CRUD IndexedDB store `documents`, satu-satunya pintu baca/tulis (client-only)
      types.ts                  # DocumentRepository saja
  lib/
    document/
      types.ts                  # DocumentProcessor interface (server-only sejak Amandemen OCR)
      getDocumentProcessor.ts   # DocumentProcessorFactory (fungsi, bukan class — lihat catatan)
      processors/
        imageProcessor.ts       # memanggil getOCRProvider() — SATU-SATUNYA alasan modul ini server-only
        pdfProcessor.ts
        documentFileProcessor.ts   # lihat catatan penamaan di §5
        spreadsheetProcessor.ts
        presentationProcessor.ts
    indexedDb.ts                 # + object store `documents` (DB_VERSION 1 → 2)
  app/api/document/process/
    route.ts                     # batas server — satu-satunya pemanggil getDocumentProcessor()
  types/
    index.ts                     # + DocumentCategory, DocumentStatus, DocumentRecord, ProcessorResult, ProcessingResult, NormalizedContent
  store/
    useAppStore.ts                # + slice `documents` (non-persisted, partialize) + setDocument/removeDocument
```

**Catatan penyesuaian dari contoh awal:** tidak dibuat folder terpisah `factory/` dan `models/` seperti contoh di brief — factory tetap berupa satu fungsi di file tunggal (`getDocumentProcessor.ts`), mengikuti pola `lib/ai/getAIProvider.ts` yang sudah ada dan terbukti di repo ini. `services/document/` dan `lib/document/` terpisah bukan karena mengikuti contoh, tapi karena keduanya punya batasan eksekusi yang berlawanan (IndexedDB = wajib client-only; processor OCR = wajib server-only) — lihat Amandemen di atas.

---

## 4. Domain Model

| Model | Fungsi |
|---|---|
| `DocumentCategory` | `"image" \| "pdf" \| "document" \| "spreadsheet" \| "presentation"` — union tertutup, dipakai sebagai key Strategy/Factory dan pengganti `UploadCategory` lama. |
| `DocumentStatus` | `"pending" \| "processing" \| "extracted" \| "needs_ocr" \| "completed" \| "failed"` — status siklus hidup satu `DocumentRecord`. Lihat §6 untuk transisi lengkap. |
| `ProcessorResult` | Output **mentah** langsung dari `DocumentProcessor.process()`. Bentuknya belum dijamin seragam antar kategori — boleh beda field per jenis processor (`{ status, rawText?, pageCount?, sheetNames?, slideCount?, raw?, errorCode?, errorMessage? }`). |
| `ProcessingResult` | Output **setelah Normalize** — bentuk yang dijamin seragam untuk semua kategori, ini yang ditulis ke `DocumentRecord` (`{ status, content: NormalizedContent \| null, requiresOCR, errorCode?, errorMessage? }`). |
| `NormalizedContent` | Isi konten final dalam bentuk seragam: `{ text, sourceType, pageCount?, sheetNames?, slideCount? }`. |
| `DocumentRecord` | Entity persisted di IndexedDB `documents` store. `id` **sama persis** dengan `UploadedFileMeta.id` (1:1, dipakai sebagai foreign key implisit ke blob di store `files`) — tidak ada id terpisah. Berisi `category`, `status`, `content`, `errorCode?`, `errorMessage?`, `retentionPolicy?` (reserved), `createdAt`, `updatedAt`. *(Catatan audit Juli 2026: field `summary?` yang semula direncanakan reserved di baris ini **tidak pernah ditambahkan ke kode** — dan per `AI_ARCHITECTURE_FREEZE.md` §8, hasil AI disimpan di store IndexedDB terpisah, bukan menempel di `DocumentRecord`, jadi field itu memang tidak akan pernah dibutuhkan.)* **Tidak menduplikasi** `filename`/`size`/`mimeType` — data itu tetap tinggal di `UploadedFileMeta` (Zustand), dibaca lewat join by-id saat dibutuhkan, supaya tidak ada dua sumber kebenaran untuk metadata yang sama. |
| Metadata (`UploadedFileMeta`) | **Tidak berubah** — tetap type yang sudah ada (`id, filename, size, mimeType, category, status, createdAt`). `DocumentRecord` adalah entity terpisah yang saling berelasi lewat `id`, bukan perluasan dari type ini. |

**Catatan penyelesaian ambiguitas:** brief awal menyebut "ProcessingResult" dan "ProcessorResult" sebagai dua item terpisah tanpa merinci bedanya. Di dokumen ini keduanya didefinisikan eksplisit sebagai dua tahap berbeda dalam pipeline (raw → normalized) — ini konsisten dengan diagram pipeline yang punya tahap "Normalize" terpisah dari "Processor" (§6), dan memberi ruang supaya tahap Normalize bisa berkembang independen (mis. nanti menambah language detection atau chunking) tanpa mengubah kontrak `DocumentProcessor.process()`.

---

## 5. Strategy Pattern

```
                     ┌────────────────────┐
                     │  DocumentProcessor  │  ← interface (Strategy contract)
                     └─────────┬──────────┘
          ┌───────────┬────────┼────────┬───────────────┐
          ▼           ▼        ▼        ▼               ▼
   ImageProcessor PdfProcessor DocumentFileProcessor SpreadsheetProcessor PresentationProcessor
```

- `DocumentProcessor` — interface, satu-satunya kontrak yang diketahui pemanggil (`documentService`).
- 5 kelas/objek konkret, masing-masing satu file di `processors/`, semuanya Sprint 1 = **stub** (lihat §6 untuk status yang dihasilkan tiap stub).
- `DocumentProcessorFactory` (`getDocumentProcessor(category)`) — memilih strategy berdasarkan `DocumentCategory`, implementasi berupa `Record<DocumentCategory, DocumentProcessor>` + fungsi lookup, mengikuti pola `getAIProvider()` yang sudah ada. Karena `DocumentCategory` adalah union tertutup yang sudah tervalidasi sebelum sampai ke factory, TypeScript memaksa map ini exhaustive — tidak mungkin ada kategori tanpa processor terdaftar tanpa gagal compile.

**Catatan penyelesaian ambiguitas (penting):** brief awal mendaftarkan strategy konkret untuk kategori `"document"` dengan nama **`DocumentProcessor`** — nama yang sama persis dengan interface Strategy-nya sendiri. Ini kolusi nama yang harus diselesaikan sebelum implementasi (persis tujuan architecture freeze: menangkap hal seperti ini sekarang, bukan saat coding). Keputusan: kelas konkret untuk kategori `"document"` (Word-like: .doc/.docx) diberi nama **`DocumentFileProcessor`**. Nama interface `DocumentProcessor` direservasi khusus untuk kontrak/Strategy, tidak pernah dipakai untuk implementasi konkret.

---

## 6. Pipeline

```
Upload
  ↓
Validate               (validateFile() — sudah ada, tidak berubah)
  ↓
Detect                 (detectUploadCategory() — diperluas ke 5 DocumentCategory)
  ↓  [OTOMATIS, tanpa aksi user]
Factory                 getDocumentProcessor(category)
  ↓
Processor               processor.process(blob, meta) → ProcessorResult
  ↓
Normalize                normalizeContent(ProcessorResult) → ProcessingResult
  ↓
Save Document Record     documentRepository.save(DocumentRecord) → IndexedDB `documents`
  ↓
Update UI                 Zustand `documents` mirror di-update → komponen re-render
```

**Status yang dihasilkan tiap processor stub di Sprint 1** (menggantikan pola "stub selalu sukses" dari draft desain sebelumnya):

| Kategori | Status `ProcessorResult`/`DocumentRecord` di Sprint 1 | Alasan |
|---|---|---|
| `image` | `needs_ocr` | Bukan error — memang menunggu tahap OCR yang direncanakan Sprint 3, ini keadaan valid dan diketahui. |
| `pdf` | `failed`, `errorCode: "NOT_IMPLEMENTED"` | Parser lokal belum ada sampai Sprint 2. `errorCode` membedakan dari kegagalan asli (mis. file korup, yang akan pakai `errorCode` lain). |
| `document` | `failed`, `errorCode: "NOT_IMPLEMENTED"` | sda |
| `spreadsheet` | `failed`, `errorCode: "NOT_IMPLEMENTED"` | sda |
| `presentation` | `failed`, `errorCode: "NOT_IMPLEMENTED"` | sda |

`extracted` dan `completed` **tidak tercapai di Sprint 1** — baru reachable mulai Sprint 2 setelah parser lokal terpasang. Ini disengaja: Sprint 1 mengirim pipeline yang jujur soal keterbatasannya, bukan pipeline yang berpura-pura selesai.

**(Update Sprint 2 & 3 — tabel di atas sudah sepenuhnya usang, dipertahankan sebagai catatan sejarah M2/M3):** `imageProcessor` sekarang memanggil OCR.Space sungguhan (Amandemen 1, §13). `pdfProcessor`/`documentFileProcessor`/`spreadsheetProcessor`/`presentationProcessor` sekarang berisi parser lokal sungguhan (Amandemen 2) — hanya `.ppt` legacy dalam kategori `presentation` yang tetap `NOT_IMPLEMENTED` permanen (bukan menunggu sprint berikutnya, murni tidak ada library JS yang layak). Rujuk `docs/08_DOCUMENT_PIPELINE.md` untuk status final yang akurat per kategori.

---

## 7. Storage

**IndexedDB** (Single Source of Truth):
- `files` — blob mentah, key = id (sudah ada, tidak berubah)
- `documents` — `DocumentRecord` penuh termasuk `content.text` dan (nanti) `summary` AI. **Baru**, ditambahkan Sprint 1.

**Zustand** (UI state murni, non-persisted untuk bagian dokumen):
- `documents` — mirror untuk reaktivitas UI, **tidak disimpan ke localStorage**. *(Catatan audit Juli 2026: implementasi aktual menyimpan `DocumentRecord` **penuh** di mirror ini, bukan versi ringan "id, category, status saja" seperti rencana awal — tetap aman karena `partialize` mengecualikannya dari persist.)*
- ~~`selectedDocumentId`~~, ~~`processingStatus`~~, ~~`isHydratingDocuments`~~, ~~`documentFilter`~~, ~~`documentSort`~~ — *direncanakan di sini tapi **tidak pernah diimplementasikan**: implementasi final tidak membutuhkannya (status pipeline sudah terbaca langsung dari `documents`, dan hydration dilakukan `useFileUpload` saat mount tanpa flag khusus). (Catatan audit Juli 2026.)*

**localStorage** (lewat Zustand `persist` middleware, tidak berubah cakupannya):
- `uploadedFiles` (metadata upload, sudah ada — tetap di sini, di luar cakupan revisi ini)
- preferensi user, state aplikasi ringan lain yang sudah ada sebelumnya

**Prinsip:** `DocumentRecord` — termasuk extracted text dan (nanti) AI result — **tidak pernah** masuk localStorage. IndexedDB `documents` adalah satu-satunya sumber kebenaran; Zustand `documents` hanyalah cache reaktif yang di-hydrate dari IndexedDB saat app dibuka dan disinkronkan tiap kali `documentService` menulis record baru.

---

## 8. Migration Strategy

**Zustand persist version:**
- Tambah versioning dan fungsi `migrate(persistedState, version)` pada konfigurasi `persist()` di `useAppStore.ts`. *(Catatan audit Juli 2026: rencana awal di sini menulis `version: 2` dan backup `__backup_v1`; implementasi aktual — sesuai Amandemen 2 — memakai `version: 1` dengan backup ke `smart-study-planner-store__backup_v0`, karena ini bump versi persist pertama yang benar-benar terjadi.)*
- Migrasi men-transform `uploadedFiles[i].category === "document"` (makna lama = PDF) → `"pdf"` (makna baru). Remap ini **aman dan tidak ambigu** karena sistem lama (`ALLOWED_FILE_TYPES` sebelum Sprint 1) hanya pernah menerima `.pdf` di bawah kategori `"document"` — tidak ada kemungkinan record lama `"document"` sebenarnya berarti Word.
- Kategori baru `"document"` (Word/.doc/.docx) otomatis mulai kosong pasca-migrasi, karena file jenis ini memang belum pernah bisa diupload sebelum Sprint 1.
- `partialize` ditambahkan agar slice `documents` (Document Record penuh) **tidak pernah** ikut ke localStorage, sekalipun ada di objek store yang sama.

**Category migration (ringkasan):** satu aturan tunggal, `"document"` → `"pdf"`, diterapkan sekali saat hydration versi 2. Tidak ada aturan lain karena tidak ada kategori lama selain `image`/`document`/`spreadsheet`.

**IndexedDB version:**
- `DB_VERSION` naik dari `1` → `2`.
- `upgrade()` callback di `lib/indexedDb.ts` mendapat tambahan branch: buat object store `documents` jika belum ada.
- Ini murni **additive** — store `files` yang sudah ada tidak disentuh sama sekali oleh upgrade ini.

**Object store migration:** tidak ada migrasi data *di dalam* IndexedDB (store `documents` baru dibuat kosong, tidak ada data lama yang perlu ditransformasi di sana — beda dengan migrasi Zustand yang memang mentransformasi data lama).

**Backward compatibility:**
- Upload lama (file yang sudah tersimpan sebelum Sprint 1) tetap bisa diakses dan didownload/dipreview seperti biasa — blob-nya tidak tersentuh oleh migrasi apa pun.
- File lama **tidak otomatis** mendapat `DocumentRecord` (tidak retroactive processing) — keputusan sadar supaya migrasi tetap ringan dan dapat diprediksi saat app dibuka pertama kali setelah update. UI menampilkan file semacam ini sebagai "belum diproses", bukan error.

**Rollback plan bila migrasi gagal:**
- *Zustand:* sebelum `migrate()` menulis ulang state, simpan salinan JSON mentah persisted state lama ke key localStorage terpisah (mis. `smart-study-planner-store__backup_v1`) sebelum di-transform. Jika `migrate()` melempar error, bungkus dalam try/catch di level pemanggilan `persist` — tangkap, log ke console, dan **jangan biarkan seluruh app gagal hydrate**: field yang gagal ditransformasi di-default ke state kosong yang aman (bukan seluruh store direset), field lain yang berhasil dimigrasi tetap dipakai. Backup mentah tetap ada di localStorage untuk diperiksa/dipulihkan manual bila perlu.
- *IndexedDB:* `idb`'s `upgrade()` berjalan dalam satu `versionchange` transaction — kalau callback ini melempar error, browser otomatis membatalkan seluruh transaksi dan versi DB **tidak berubah** (tidak ada state IndexedDB yang setengah-bermigrasi). Ini jaminan native dari IndexedDB sendiri, tidak perlu rollback manual untuk bagian ini.

---

## 9. Risks

| Risiko | Mitigasi |
|---|---|
| Migrasi Zustand gagal / data lama corrupt | try/catch di `migrate()`, backup raw JSON sebelum transform, fallback per-field (bukan reset total) — lihat §8 |
| IndexedDB upgrade diblokir tab lain yang masih pakai versi lama | Pasang handler `blocked`/`blocking` dari `idb`; untuk Sprint 1 cukup tampilkan pesan minta reload tab lain (app single-user, browser lokal — tidak perlu solusi multi-tab kompleks) |
| Hydration race condition — mirror Zustand `documents` kosong sesaat sebelum IndexedDB selesai dibaca saat app dibuka | Flag `isHydratingDocuments`; komponen daftar dokumen menunggu flag ini `false` sebelum menampilkan "empty state", supaya tidak flash "tidak ada dokumen" secara keliru |
| Processor registration tidak lengkap (lupa daftarkan salah satu dari 5 processor) | `Record<DocumentCategory, DocumentProcessor>` yang exhaustive — TypeScript gagal compile kalau ada kategori tanpa processor terdaftar, jadi ini tertangkap otomatis, bukan lewat checklist manual |
| Kolusi nama `DocumentProcessor` (interface) vs strategy konkret kategori `document` | Sudah diselesaikan di §5: strategy konkret dinamai `DocumentFileProcessor` |
| Auto-trigger pipeline menambah latensi setelah upload | `processDocument()` dijalankan tidak-blocking dari `useFileUpload` — tidak menahan status upload jadi `"ready"`; status pipeline ditampilkan terpisah dari status upload di UI |
| Backward compatibility — file lama tanpa `DocumentRecord` | Bukan bug, keputusan sadar (§8) — UI wajib menampilkan state "belum diproses" yang jelas, bukan error atau silent |
| Duplikasi metadata antara `DocumentRecord` dan `UploadedFileMeta` kalau developer lain tidak sadar aturan "join by id" | Ditulis eksplisit di §4: `DocumentRecord` dilarang menduplikasi `filename`/`size`/`mimeType` |

---

## 10. Deliverables

**Selesai (Sprint 1):**
- ✅ `DocumentProcessor` interface
- ✅ Strategy Pattern (5 processor stub)
- ✅ `DocumentProcessorFactory`
- ✅ Domain model (`DocumentCategory`, `DocumentStatus`, `ProcessorResult`, `ProcessingResult`, `DocumentRecord`)
- ✅ IndexedDB `documents` store + `documentRepository`
- ✅ `documentService` (orchestrator)
- ✅ Integrasi pipeline otomatis ke alur upload
- ✅ Migrasi `UploadCategory` → `DocumentCategory` (data + skema)
- ✅ Zustand UI mirror (non-persisted)

**Belum (di luar Sprint 1, status terkini di Amandemen 1 & 2):**
- ✅ ~~OCR sungguhan~~ — selesai
- ✅ ~~Parser lokal sungguhan (PDF/DOC/XLS/PPTX)~~ — selesai, kecuali `.ppt` legacy (ditolak permanen, bukan "belum")
- ❌ AI Summary / Gemini integration
- ❌ Flashcard Generator
- ❌ Quiz Generator
- ❌ Task Recommendation
- ❌ Calendar Recommendation
- ❌ Document Lifecycle policy (Keep Original/Balanced/Storage Saver)

---

## 11. Milestone Breakdown

Setiap milestone independen dan bisa direview/diuji terpisah. M1–M5 murni additive (file baru, tidak ada yang memanggilnya, aman digabung terpisah). **M6 adalah satu-satunya milestone yang mengubah perilaku runtime yang sudah ada** — butuh perhatian ekstra saat review.

| Milestone | Isi |
|---|---|
| M1 — Domain Model | `DocumentCategory`, `DocumentStatus`, `DocumentRecord`, `ProcessorResult`, `ProcessingResult`, `NormalizedContent` di `src/types/index.ts`; perluas `ALLOWED_FILE_TYPES` ke 5 kategori |
| M2 — Processor Interface | `DocumentProcessor` interface di `services/document/types.ts` |
| M3 — Processor Factory & Stub | 5 processor stub (termasuk `DocumentFileProcessor`) + `getDocumentProcessor.ts` |
| M4 — IndexedDB Documents | Bump `DB_VERSION` 1→2, tambah store `documents`, fungsi CRUD low-level di `lib/indexedDb.ts`, lalu `documentRepository.ts` |
| M5 — Document Service | `documentService.ts` (orchestrator: detect→factory→process→normalize→save), belum dipanggil dari mana pun |
| M6 — Pipeline Integration | Wire `documentService.processDocument()` ke `useFileUpload`; tambah slice `documents` + UI state di `useAppStore.ts`; `persist` version/migrate/partialize |
| M7 — Testing | Upload manual tiap 5 kategori → verifikasi `DocumentRecord` & status benar; test migrasi dengan data lama; verifikasi `files` store tidak hilang setelah bump versi |
| M8 — Documentation Update | Update `08_DOCUMENT_PIPELINE.md`, `11_SERVICES.md`, `05_DATABASE.md`, `12_STORES.md` supaya dokumentasi kembali sinkron dengan implementasi nyata |

---

## 12. Acceptance Criteria

- Upload lama (5 kategori, termasuk yang sebelumnya cuma 3) tetap berfungsi tanpa regresi.
- Tidak ada breaking change pada kontrak komponen upload yang sudah ada (`UploadDropzone`/`UploadFileList`/`UploadFileItem` tidak perlu diubah kontraknya).
- Semua blob file lama di IndexedDB `files` tetap dapat diakses setelah `DB_VERSION` naik ke 2.
- Data `uploadedFiles` lama di localStorage berhasil bermigrasi (`"document"` → `"pdf"`) tanpa data hilang.
- `DocumentRecord` berhasil tersimpan ke IndexedDB `documents` untuk setiap upload baru, dengan status sesuai tabel §6.
- Strategy Pattern dapat diperluas (menambah processor kategori baru) tanpa mengubah `documentService.ts`, factory, atau komponen UI manapun.
- Pipeline berjalan otomatis setelah upload sukses, tanpa aksi manual user.
- Extracted text / AI result tidak pernah masuk localStorage — dapat diverifikasi lewat isi `partialize`.
- `next build` tetap sukses, tidak ada TypeScript error baru.

---

## 13. OCR Pipeline (Sprint 3)

Status: **Selesai dan diverifikasi end-to-end** dengan API key sungguhan (bukan mock). Batas: hanya kategori `image`. `pdf`/`document`/`spreadsheet`/`presentation` masih `NOT_IMPLEMENTED` (Sprint 2).

### Bagaimana OCR dipanggil

`imageProcessor` (`src/lib/document/processors/imageProcessor.ts`) memanggil `getOCRProvider().extractText(blob, meta)` — provider yang sama yang dibangun terpisah sebelumnya (`src/lib/ocr/providers/ocrSpaceProvider.ts`), tidak ada perubahan pada `OCRProvider`/`OCRResult`. Karena OCR.Space butuh `OCR_SPACE_API_KEY`, pemanggilan ini **hanya boleh terjadi di server** — itulah sebabnya `imageProcessor` (dan seluruh `lib/document/processors/*`) dipindah keluar dari `services/` (lihat Amandemen di atas).

### Bagaimana DocumentService bekerja

`documentService.ts` (`src/services/document/documentService.ts`) adalah orchestrator **client-side murni** — tidak pernah mengimpor `lib/document/*` atau `lib/ocr/*` secara langsung, supaya kode ber-API-key tidak pernah ikut ter-bundle ke browser. Alurnya:

1. `processDocument(meta: UploadedFileMeta)` dipanggil (fire-and-forget, tidak-blocking) oleh `useFileUpload` tepat setelah `saveFileToStorage()` sukses.
2. Simpan `DocumentRecord` berstatus `"pending"` ke `documentRepository` (IndexedDB).
3. Ambil blob dari IndexedDB (`getFileFromStorage`), update status jadi `"processing"`.
4. Kirim blob + meta + category via `fetch("/api/document/process", { body: FormData })` — pola identik `services/ai/aiService.ts` → `/api/ai/*`.
5. Route (`src/app/api/document/process/route.ts`, server) menerima `FormData`, memanggil `getDocumentProcessor(category).process(blob, meta)`, mengembalikan `ProcessorResult` sebagai JSON.
6. `documentService` menormalisasi hasil ke `DocumentRecord` final (`status`, `content`, `confidence`, `provider`, `processingTimeMs`, `processedAt`, `errorCode`/`errorMessage`) dan menyimpannya via `documentRepository.save()`.
7. Caller (`useFileUpload`) menerima `DocumentRecord` yang di-resolve, memanggil `setDocument()` (Zustand, non-persisted) supaya UI reaktif tanpa perlu reload.

### Bagaimana hasil OCR disimpan

Sama seperti desain awal §7 — `DocumentRecord` lengkap (termasuk `content.text` hasil OCR) hanya masuk IndexedDB `documents`, tidak pernah ke localStorage (diverifikasi langsung: kunci `documents` tidak ada di `localStorage["smart-study-planner-store"]`, dan teks hasil ekstraksi tidak muncul di string mentahnya). Zustand `documents` di-hydrate dari `documentRepository.findAll()` sekali saat `useFileUpload` mount, supaya hasil lama tetap terlihat setelah reload tanpa perlu upload ulang.

### Status mapping final

| `ProcessorResult.status` (dari OCR) | `DocumentRecord.status` | Kapan |
|---|---|---|
| `extracted` | `completed` | OCR sukses, `content.text` terisi |
| `needs_ocr` | `needs_ocr` | Tidak lagi dihasilkan `imageProcessor` (OCR sudah terjadi di dalam `process()`), direservasi untuk processor lain di masa depan |
| `failed` | `failed` | API key kosong, tipe file tak didukung, HTTP error, rate limit, timeout, network error, `IsErroredOnProcessing`, atau hasil kosong — `errorCode` membedakan penyebabnya |

### UI verifikasi

`UploadFileItem.tsx` menampilkan panel debug kecil (status, provider, confidence bila ada, waktu proses, jumlah halaman, dan teks hasil ekstraksi lewat `<details>`) untuk tiap file — dibangun eksplisit sebagai alat verifikasi Sprint 3, bukan desain final.
