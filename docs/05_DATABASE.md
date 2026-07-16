# Database

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

> Konteks penting: lihat [04_AUTHENTICATION](./04_AUTHENTICATION.md) untuk alasan kenapa Supabase dibatasi hanya untuk auth. Dokumen ini menjelaskan skema yang **sudah terlanjur dibuat** di Supabase (project `smart-study-planner-web`) sebelum keputusan itu final, dan status tiap tabel sekarang.

## Ringkasan status

| Kategori | Tabel | Status |
|---|---|---|
| **Masih dipakai** | `profiles` | ✅ Aktif — diisi otomatis lewat trigger saat register, dibaca saat login |
| **Obsolete** (ada, RLS aktif, tapi kosong & tidak dipakai kode manapun) | `courses`, `categories`, `tasks`, `subtasks`, `class_schedules`, `study_sessions`, `preferences`, `widget_preferences`, `achievements`, `chat_messages` | ⚠️ Tidak dihapus — lihat alasan di bawah |

**Tidak ada satupun tabel yang dihapus dalam dokumentasi ini** — sesuai arahan, ini murni pencatatan kondisi, bukan pembersihan.

## `profiles` — satu-satunya tabel aktif

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | uuid (PK) | = `auth.users.id` |
| `name` | text | Diisi dari metadata signup |
| `email` | text | |
| `university` | text, nullable | **Sudah tidak diisi** — form register tidak lagi mengumpulkan ini (lihat [17_TECH_DEBT](./17_TECH_DEBT.md)) |
| `major` | text, nullable | Sama seperti `university` |
| `semester` | integer, nullable | Sama seperti `university` |
| `is_premium` | boolean | Default `false` |
| `created_at` | timestamptz | |

Diisi otomatis lewat trigger Postgres `handle_new_user()` setiap ada baris baru di `auth.users` — mengambil `name`/`university`/`major`/`semester` dari `raw_user_meta_data` (kalau tidak ada, otomatis jadi `null`, tidak error). RLS: user hanya bisa baca/update baris miliknya sendiri.

## 10 tabel obsolete

Dibuat saat rencana awal adalah "pindahkan semua data ke Supabase" (lihat [16_ROADMAP](./16_ROADMAP.md)). Rencana itu dibatalkan **sebelum** tabel-tabel ini pernah benar-benar dipakai — jadi semuanya kosong (0 baris), dan tidak ada satupun kode aplikasi yang membaca/menulis ke sana. Semuanya punya struktur RLS yang benar (`user_id` + kebijakan `auth.uid()`) kalau suatu saat memang dibutuhkan kembali.

| Tabel | Untuk apa (kalau dipakai) |
|---|---|
| `courses` | Mata kuliah — sudah digantikan konsep "Aktivitas" per kategori di frontend |
| `categories` | Kategori tugas — versi Supabase dari `useAppStore().categories` |
| `tasks` | Tugas — versi Supabase dari `useAppStore().tasks` |
| `subtasks` | Subtask checklist per tugas |
| `class_schedules` | Jadwal kuliah mingguan |
| `study_sessions` | Sesi belajar (dari smart schedule generator) |
| `preferences` | Preferensi pengguna (tema, bahasa, dll) |
| `widget_preferences` | Pengaturan widget dashboard |
| `achievements` | Progress achievement/gamifikasi |
| `chat_messages` | Riwayat chat AI Assistant |

**Rekomendasi (belum dieksekusi):** tabel-tabel ini kandidat untuk di-*drop* karena kehadirannya berisiko membingungkan developer baru ("kenapa ada tabel tasks kalau datanya di localStorage?"). Ini operasi database yang merusak (destructive) — sengaja tidak dieksekusi tanpa persetujuan eksplisit. Lihat [17_TECH_DEBT](./17_TECH_DEBT.md).

## Migration yang sudah diterapkan

1. `smart_study_planner_initial_schema` — membuat 11 tabel di atas + RLS + trigger `handle_new_user`.
2. `harden_functions_and_optimize_rls` — perbaikan hasil temuan Supabase security/performance advisor: kunci `search_path` pada function, cabut akses publik ke function `SECURITY DEFINER`, optimasi 12 RLS policy (`auth.uid()` dibungkus `(select ...)` supaya dievaluasi sekali per query, bukan per baris).
3. `handle_new_user_include_profile_fields` — memperluas trigger supaya juga mengisi `university`/`major`/`semester` dari metadata signup.

TypeScript types hasil generate dari skema ini ada di `src/lib/supabase/database.types.ts` — **harus di-generate ulang manual** kalau skema berubah (tidak otomatis sinkron). Lihat [13_CONFIGURATION](./13_CONFIGURATION.md).

## Kenapa `text` + `CHECK`, bukan Postgres enum native

Kolom seperti `priority`, `difficulty`, `status`, `theme` sengaja pakai `text` dengan `CHECK` constraint, bukan tipe `enum` native Postgres. Alasannya: nilai-nilai ini (khususnya `TaskStatus`) sudah terbukti berubah beberapa kali dalam riwayat project ini, dan `CHECK` jauh lebih murah diubah dibanding `ALTER TYPE` pada enum native.
