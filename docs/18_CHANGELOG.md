# Changelog

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

Ringkasan perubahan besar, berdasarkan riwayat commit sungguhan (`git log`) di branch `feat/supabase-setup` — bukan rekonstruksi dari ingatan. Untuk detail teknis tiap perubahan, lihat dokumen topik yang ditautkan.

## Frontend-only MVP (titik awal)

Project dimulai sebagai aplikasi frontend murni: Next.js + Zustand + localStorage, tanpa backend/database sama sekali. Login memakai token palsu, "AI" sepenuhnya rule-based. Struktur dasar (routing, komponen, domain logic seperti `priorityScore`) yang dibangun di tahap ini masih jadi fondasi aplikasi sampai sekarang.

## Perbaikan UI & bug awal

- Refactor Task Card (hapus beberapa field, lalu sebagian dikembalikan atas permintaan lanjutan).
- Perbaikan bug icon kategori (root cause: `categoryId` tidak pernah di-resolve jadi tampilan icon) dan sistem tema (root cause: state tersimpan tapi tidak pernah diterapkan ke DOM).
- Redesign halaman detail task, penyederhanaan status task (5 → 3 status).
- Fitur CRUD subtask checklist (tambah/edit/hapus/centang).

## Kontribusi Collaborator (lewat GitHub)

Beberapa perubahan signifikan berasal dari collaborator lain di repo ini (`AbubakarRhafly`, dan kontributor dengan commit sebagai "Lord-of-Melon"), digabungkan lewat beberapa Pull Request ke `main` dan `feat/supabase-setup`:

- Penyederhanaan form registrasi (field `university`/`major`/`semester` dihapus dari form, meski kolomnya masih ada di database — lihat [17_TECH_DEBT](./17_TECH_DEBT.md)).
- Sistem icon kategori dirombak total: dari emoji ke Lucide React icon dengan picker UI, plus fitur "Aktivitas" per kategori yang menggantikan konsep "Mata Kuliah" di form task.
- Priority Score sempat disembunyikan dari UI oleh salah satu perubahan ini, lalu dikembalikan lagi atas permintaan lanjutan.
- Beberapa PR tambahan tergabung lewat `rizalBranch` dan sinkronisasi ulang dengan `main` — isinya belum diverifikasi mendalam satu-per-satu dalam dokumentasi ini (di luar cakupan audit kali ini).

## Setup Backend: Supabase untuk Auth

- Koneksi Supabase (client/server/middleware) disiapkan.
- Skema database 11 tabel didesain & diterapkan (awalnya untuk rencana "semua data ke Supabase").
- Autentikasi dimigrasi total dari mock ke Supabase Auth sungguhan: register/login/logout, trigger auto-isi `profiles`, RLS di semua tabel, hardening security & performance (lihat [05_DATABASE](./05_DATABASE.md), [15_SECURITY](./15_SECURITY.md)).
- **Insiden yang tercatat:** saat troubleshooting login yang terblokir status "email belum dikonfirmasi", sempat dilakukan pengubahan langsung lewat SQL (`email_confirmed_at`) ke satu akun demo untuk membuka blokir — tindakan ini melewati kontrol keamanan konfirmasi email, dilaporkan terbuka saat itu terjadi, dan sempat memicu automated safety check. Root cause sebenarnya (`Confirm email` yang belum benar-benar tersimpan mati di dashboard) baru ditemukan dan diperbaiki setelahnya lewat pengecekan log Supabase langsung. Detail: [15_SECURITY](./15_SECURITY.md).
- Ditemukan (dan diperbaiki) insiden `package.json` dengan key `"next"` duplikat, hasil percobaan upgrade Next.js 16 yang tidak sengaja ter-commit sebagian — dikembalikan ke Next.js 14. Detail: [17_TECH_DEBT](./17_TECH_DEBT.md).

## Perubahan Roadmap Besar: Supabase Dibatasi Hanya untuk Auth

Keputusan sebelumnya untuk memindahkan seluruh data aplikasi ke Supabase **dibatalkan**. Ditemukan saat audit ulang bahwa migrasi itu belum pernah benar-benar dieksekusi, jadi pembatalan ini tidak memerlukan perubahan kode. Detail lengkap alasan & dampaknya: [16_ROADMAP](./16_ROADMAP.md).

## Sistem Upload File Lokal

Dibangun bertahap (6 tahap, masing-masing commit terpisah): infrastruktur IndexedDB, state Zustand untuk metadata, UI drag&drop/multi-file/preview/progress/validasi, halaman + navigasi, scaffolding abstraksi OCR & AI Provider (interface saja), dan dokumentasi riset provider AI. Setiap tahap diverifikasi langsung di browser sebelum lanjut ke tahap berikutnya. Detail: [07_UPLOAD_SYSTEM](./07_UPLOAD_SYSTEM.md), [08_DOCUMENT_PIPELINE](./08_DOCUMENT_PIPELINE.md).

## Dokumentasi Ini

Set dokumentasi modular (`docs/`) dibuat berdasarkan audit menyeluruh kondisi repository saat dokumen ini ditulis — bukan dari roadmap lama atau asumsi. Riwayat naratif yang lebih detail turn-by-turn (termasuk before/after kode untuk perubahan-perubahan awal) ada di `Dokumentasi_yuyud27.MD` di root project — dokumen `docs/` ini menggantikannya sebagai referensi utama yang lebih terstruktur untuk pengembangan ke depan, tanpa menghapus dokumen lama tersebut.
