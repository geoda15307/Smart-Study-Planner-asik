# Project Constitution

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

Prinsip inti yang mengatur project ini — bukan status pengembangan (lihat [16_ROADMAP](./16_ROADMAP.md) untuk itu) atau riwayat perubahan (lihat [18_CHANGELOG](./18_CHANGELOG.md)), tapi **aturan yang seharusnya tidak berubah** kecuali lewat keputusan sadar dan eksplisit. Kalau perubahan yang diusulkan bertentangan dengan pasal di bawah, itu tandanya perlu didiskusikan dulu, bukan langsung dikerjakan.

## Pasal 1 — Pembagian Tanggung Jawab Penyimpanan Data

> **Supabase = Identity Provider. Local Storage (Zustand/localStorage/IndexedDB) = seluruh data aplikasi.**

Supabase **hanya** boleh dipakai untuk: register, login, logout, session management, dan profil dasar yang berhubungan langsung dengan identitas (`profiles`). **Tidak ada data aplikasi apapun** — task, kategori, jadwal, preferensi, achievement, riwayat chat, file upload, hasil OCR, ringkasan AI — yang boleh disimpan di Supabase. Semuanya lokal.

Ini bukan batasan sementara — ini keputusan final setelah rencana sebaliknya sempat dipertimbangkan dan dibatalkan (lihat [16_ROADMAP](./16_ROADMAP.md), [21_ARCHITECTURAL_DECISIONS](./21_ARCHITECTURAL_DECISIONS.md) ADR-001/002). Menambah tabel Supabase baru untuk data aplikasi, atau menulis data task/kategori/dll ke Supabase, **melanggar pasal ini** — harus ditolak atau dipertanyakan dulu, bukan langsung diimplementasikan.

## Pasal 2 — Bahasa

Antarmuka pengguna (UI copy) dan literal domain (status, label) berbahasa Indonesia. Kode (nama variabel/fungsi/komponen) berbahasa Inggris. Dokumentasi teknis boleh keduanya sesuai konteks — dokumen di `docs/` ini berbahasa Indonesia mengikuti bahasa permintaan yang membuatnya.

## Pasal 3 — Provider AI dan OCR Harus Modular

Tidak boleh hardcode satu provider AI atau OCR tertentu langsung ke dalam UI atau route API. Semua pemanggilan provider AI/OCR **wajib** lewat abstraksi interface (`AIProvider`, `OCRProvider` di [11_SERVICES](./11_SERVICES.md)), supaya provider bisa diganti lewat konfigurasi (`AI_PROVIDER` env var), bukan lewat mengubah kode di banyak tempat.

## Pasal 4 — Perubahan yang Merusak (Destruktif) Butuh Izin Eksplisit

Tidak ada penghapusan data, tabel database, atau kode yang dianggap "sudah tidak dipakai" tanpa persetujuan eksplisit lebih dulu — termasuk yang tercatat sebagai dead code di [17_TECH_DEBT](./17_TECH_DEBT.md). Mencatat sesuatu sebagai obsolete **bukan** izin untuk menghapusnya.

## Pasal 5 — Tidak Ada Kode atau Fitur di Luar Kebutuhan

Jangan menambah abstraksi, konfigurasi, atau fitur untuk kebutuhan hipotetis yang belum diminta. Kalau tiga baris mirip sudah cukup, jangan dipaksa jadi abstraksi. Perubahan yang tidak berhubungan dengan permintaan yang sedang dikerjakan tidak ikut diubah dalam perubahan yang sama.

## Pasal 6 — Verifikasi Sebelum Dianggap Selesai

`tsc --noEmit` dan `next lint` bersih **bukan** bukti fitur berfungsi — itu cuma bukti kode valid secara sintaks/tipe. Perubahan UI/perilaku harus diuji langsung (browser, atau lewat pengecekan data nyata seperti query database) sebelum dilaporkan selesai. Lihat [19_DEVELOPER_GUIDE](./19_DEVELOPER_GUIDE.md).

## Pasal 7 — Dokumentasi Mengikuti Kondisi Nyata, Bukan Rencana

Dokumentasi (termasuk seluruh isi `docs/`) harus mencerminkan apa yang **sungguhan ada** di repository saat ditulis — diverifikasi lewat audit langsung (baca kode, cek riwayat git, cek database), bukan disalin dari roadmap lama atau diasumsikan. Kalau roadmap berubah, dokumentasi yang terpengaruh harus diperbarui mengikuti kondisi baru, bukan dibiarkan basi.

---

Pasal-pasal di atas adalah kodifikasi dari arahan eksplisit yang sudah berulang kali ditegaskan sepanjang pengembangan project ini. Kalau ada permintaan baru yang tampak bertentangan dengan salah satu pasal, itu layak dikonfirmasi ulang secara eksplisit sebelum dikerjakan, bukan diasumsikan sebagai pengecualian diam-diam.
