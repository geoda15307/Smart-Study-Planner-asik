# Technical Debt

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

**Tidak ada yang dihapus dalam pembuatan dokumen ini** — murni katalog kondisi saat ini, sesuai arahan.

## Dead Code

| Item | Detail |
|---|---|
| `Course` type + `courses` seed data + `useAppStore().courses` | Awalnya untuk memilih "Mata Kuliah" saat membuat task. `TaskForm` sudah tidak memakainya (diganti "Aktivitas" per kategori) — tapi state, tipe, dan seed data-nya masih ada dan aktif di store |
| `task.courseId` / `task.courseName` | Nama kolom masih menyiratkan "mata kuliah", tapi isinya sekarang teks Aktivitas yang dipilih dari kategori. Nama field menyesatkan bagi developer baru |
| `profiles.university` / `major` / `semester` (Supabase) | Kolom masih ada (nullable), tapi form register sudah tidak mengumpulkan data ini sejak disederhanakan |
| 10 tabel Supabase (`tasks`, `categories`, `courses`, dst.) | Kosong, tidak dipakai kode manapun. Detail lengkap: [05_DATABASE](./05_DATABASE.md) |
| `WidgetPreference.enabled` / `.size` | Bisa diatur dari `WidgetPage`, tapi Dashboard tidak membaca nilainya — widget di dashboard hardcoded, tidak terhubung ke pengaturan ini |
| Folder `.gitkeep`-only di `src/components/`: `account/`, `achievement/`, `premium/`, `settings/`, `themes/`, `widget/` | Placeholder kosong, komponennya masih hidup di `FeaturePage.tsx` (lihat [10_COMPONENTS](./10_COMPONENTS.md)) |
| Folder kosong lain: `src/assets/`, `src/constants/`, `src/styles/` | Cuma `.gitkeep`, belum pernah dipakai sama sekali |
| File `.backup` tersebar di repo | `CLAUDE.md.backup`, `package.json.backup`, `tsconfig.json.backup`, `Dokumentasi_yuyud27.MD.backup`, dan beberapa file `src/**/*.backup` — hasil kebijakan backup-sebelum-edit yang diminta pengguna. Di-gitignore (`*.backup`), tidak masuk riwayat Git, tapi tetap ada di disk lokal |

## Unused Dependency

| Package | Temuan |
|---|---|
| `tailwind-merge` | **Tidak ada satupun import-nya di seluruh `src/`** (dikonfirmasi lewat pencarian menyeluruh). Terpasang di `package.json` tapi tidak dipakai kode manapun. Kandidat untuk dilepas, atau mulai benar-benar dipakai untuk merge className kondisional (tujuan awal library ini) |

Semua dependency lain terverifikasi masih dipakai — detail alasan tiap dependency: [14_DEPENDENCIES](./14_DEPENDENCIES.md).

## Duplicate / Tanggung Jawab Bercampur

| Item | Detail |
|---|---|
| `services/storage/storageService.ts` | Berisi dua kelompok fungsi tidak berhubungan dalam satu file: export JSON/CSV (fitur lama) dan penyimpanan file upload ke IndexedDB (fitur baru). Belum masalah besar karena ukurannya masih kecil, tapi berpotensi membingungkan kalau terus bertambah |

## Obsolete Migration / Konfigurasi

| Item | Detail |
|---|---|
| Insiden upgrade Next.js 16 yang tidak sengaja ter-commit sebagian | Sudah diperbaiki (kembali ke Next 14), tapi jadi pengingat: **jangan** biarkan perubahan `package.json`/`tsconfig.json` (`jsx: "react-jsx"` vs `"preserve"`) yang berasal dari eksperimen lain tercampur ke commit fitur. Detail: [18_CHANGELOG](./18_CHANGELOG.md) |
| Skema Supabase 11-tabel | Bukan "salah", tapi didesain untuk rencana yang sudah dibatalkan (lihat [16_ROADMAP](./16_ROADMAP.md)). 10 dari 11 tabelnya sekarang murni beban kognitif tanpa fungsi |

## TODO / FIXME

**Tidak ditemukan** komentar `TODO`/`FIXME`/`HACK`/`XXX` eksplisit di manapun dalam `src/` (dikonfirmasi lewat pencarian menyeluruh) — konsisten dengan gaya project ini yang memang minim komentar kode secara umum, bukan berarti tidak ada pekerjaan tertunda (lihat [16_ROADMAP](./16_ROADMAP.md) untuk daftar pekerjaan yang belum selesai secara eksplisit).

## Rekomendasi (belum dieksekusi, butuh keputusan)

1. **Drop 10 tabel Supabase obsolete** — destructive, butuh persetujuan eksplisit sebelum dieksekusi.
2. **Lepas `tailwind-merge`** dari `package.json`, atau mulai benar-benar memakainya.
3. **Rapikan penamaan** `task.courseId`/`courseName` → sesuatu yang mencerminkan "Aktivitas" (butuh migrasi tipe + penyesuaian semua pemakai, cukup invasif untuk fitur yang sudah berjalan — pertimbangkan matang sebelum eksekusi).
4. **Hubungkan `WidgetPreference`** ke Dashboard, atau evaluasi ulang apakah fitur widget-yang-bisa-diatur ini masih relevan (ini persis lingkup "Evaluasi Widget" yang sengaja ditunda — lihat [16_ROADMAP](./16_ROADMAP.md)).
