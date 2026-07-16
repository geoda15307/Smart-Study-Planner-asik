# Stores

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

Satu store, satu file: `src/store/useAppStore.ts` (Zustand + `persist` middleware → localStorage key `smart-study-planner-store`). Lihat [06_STATE_MANAGEMENT](./06_STATE_MANAGEMENT.md) untuk konteks kenapa arsitekturnya seperti ini.

## Apa yang disimpan

| State | Tipe | Sumber awal |
|---|---|---|
| `isAuthenticated`, `token`, `user` | auth-related | Diisi dari Supabase Auth saat login (lihat [04_AUTHENTICATION](./04_AUTHENTICATION.md)) |
| `courses` | `Course[]` | Seed data — **catatan:** sudah tidak dipakai `TaskForm` untuk memilih task lagi, lihat [17_TECH_DEBT](./17_TECH_DEBT.md) |
| `categories` | `Category[]` | Seed data, bisa ditambah/diubah/dihapus pengguna |
| `tasks` | `Task[]` | Seed data, CRUD penuh oleh pengguna |
| `schedules` | `ClassSchedule[]` | Seed data (jadwal kuliah mingguan) |
| `studySessions` | `StudySession[]` | Kosong di awal, diisi oleh smart schedule generator |
| `preference` | `Preference` | Seed data (tema, bahasa, dll) |
| `widgets` | `WidgetPreference[]` | Seed data — **catatan:** dashboard belum benar-benar membaca ini, lihat [17_TECH_DEBT](./17_TECH_DEBT.md) |
| `achievements` | `Achievement[]` | Seed data, progress statis (belum ada logika unlock otomatis) |
| `chatMessages` | `ChatMessage[]` | Kosong di awal, riwayat chat AI Assistant |
| `uploadedFiles` | `UploadedFileMeta[]` | Kosong di awal — **metadata saja**, blob file di IndexedDB (lihat [07_UPLOAD_SYSTEM](./07_UPLOAD_SYSTEM.md)) |

## Apa yang **tidak** disimpan di sini

- **Blob file yang diupload** — sengaja di IndexedDB, bukan di store (lihat [06_STATE_MANAGEMENT](./06_STATE_MANAGEMENT.md) untuk alasannya).
- **Progress upload per file** — state lokal di dalam hook `useFileUpload`, sengaja tidak masuk store supaya tidak memicu tulis-ulang localStorage berkali-kali per detik.
- **Data profil lengkap dari Supabase** (`university`/`major`/`semester` di tabel `profiles`) — `user` di store cuma menyimpan field yang masih dipakai UI (`id`, `name`, `email`, `isPremium`); field lain di tabel `profiles` ada tapi tidak diikutkan ke store karena form-nya sudah tidak mengumpulkan itu lagi.
- **Hasil OCR/AI Summary** — belum ada, karena fitur itu sendiri belum dibuat ([08_DOCUMENT_PIPELINE](./08_DOCUMENT_PIPELINE.md)).

## Pola action yang konsisten

Semua action collection (`tasks`, `categories`, `uploadedFiles`, dst.) mengikuti pola yang sama: `addX`, `updateX` (menerima `Partial<X>`), `removeX`/`deleteX`. Kalau menambah state collection baru, ikuti pola ini untuk konsistensi.

**Aturan khusus untuk `tasks`:** jangan pernah set `priorityScore` manual — semua action task (`addTask`/`updateTask`/`completeTask`) otomatis lewat helper `score()` di dalam store yang menghitung ulang `priorityScore` (dari `utils/priorityScore.ts`) dan `updatedAt` setiap kali. Mengubah task lewat cara lain (misalnya manipulasi langsung) akan membuat `priorityScore` basi.

## `resetDemoData()` — perilaku yang perlu diketahui

Dipanggil dari tombol "Reset Data" di Settings. Mengembalikan `courses`/`categories`/`tasks`/`schedules`/`preference`/`widgets`/`achievements` ke seed data awal, mengosongkan `studySessions`/`chatMessages`/`uploadedFiles`, **tapi mempertahankan** sesi auth yang sedang aktif (`user`/`isAuthenticated`/`token` tidak ikut direset). Catatan: mengosongkan `uploadedFiles` di store **tidak** otomatis menghapus blob-nya di IndexedDB — ini gap kecil, dicatat di [17_TECH_DEBT](./17_TECH_DEBT.md).
