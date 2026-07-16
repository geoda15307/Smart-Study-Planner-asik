# Security

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

## Authentication

- Password divalidasi Supabase Auth (bukan lagi validasi mock yang menerima apapun).
- Domain email divalidasi sungguhan oleh Supabase — mengurangi akun spam/palsu.
- Setiap tabel Supabase yang ada (termasuk 10 tabel obsolete di [05_DATABASE](./05_DATABASE.md)) sudah punya **Row Level Security** aktif dengan kebijakan `(select auth.uid()) = user_id` — kalaupun suatu saat dipakai kembali, sudah aman secara desain, tidak perlu ditambah proteksi dari nol.
- **`Confirm email` saat ini DIMATIKAN** di dashboard Supabase — akun baru langsung aktif tanpa verifikasi email. Ini keputusan sadar untuk tahap development (menghindari quota email yang sangat terbatas), **tapi perlu ditinjau ulang sebelum aplikasi dipakai pengguna sungguhan** — tanpa verifikasi email, siapapun bisa mendaftar dengan email siapapun (selama formatnya valid) tanpa membuktikan kepemilikan email tersebut.
- **Catatan riwayat (transparansi):** pernah ada tindakan mengubah `email_confirmed_at` langsung lewat SQL untuk membuka blokir login satu akun demo saat troubleshooting — ini melewati kontrol keamanan konfirmasi email. Dilakukan hanya ke satu akun test, dilaporkan terbuka saat itu terjadi, dan sempat memicu automated safety check. Dicatat di sini supaya tidak terulang tanpa sepengetahuan tim. Detail: [18_CHANGELOG](./18_CHANGELOG.md).

## API Security — celah yang perlu diketahui

**Kedua route API (`/api/ai/analyze`, `/api/ai/chat`) tidak punya pengecekan autentikasi di sisi server.** Proteksi login yang ada (`AppShell`, lihat [04_AUTHENTICATION](./04_AUTHENTICATION.md)) hanya berlaku untuk **halaman yang dirender**, bukan untuk API route itu sendiri — `middleware.ts` cuma me-refresh cookie session, tidak memblokir request tanpa session. Artinya, secara teknis, siapapun yang tahu URL endpoint-nya bisa mengirim POST request langsung tanpa login.

Dampak saat ini **rendah** karena kedua route ini rule-based (tidak memanggil API berbayar, tidak mengekspos data sensitif spesifik-user — input `tasks`/`task` dikirim langsung oleh pemanggil, bukan diambil dari database berdasar identitas). **Tapi ini menjadi penting begitu provider AI sungguhan diaktifkan** (lihat [16_ROADMAP](./16_ROADMAP.md)): tanpa pengecekan auth, siapapun bisa memicu pemanggilan API berbayar tanpa batas, membebani kuota/biaya. Rekomendasi: tambahkan pengecekan session Supabase (lewat `lib/supabase/server.ts`) di awal kedua route handler sebelum mengaktifkan provider AI sungguhan.

## Storage (client-side)

- **IndexedDB dan localStorage tidak terenkripsi** dan bisa diakses oleh script apapun yang berjalan di origin yang sama — risiko standar untuk arsitektur local-first, relevan kalau suatu saat ada celah XSS di aplikasi.
- Sisi baiknya: file yang diupload pengguna **tidak pernah meninggalkan browser mereka** kecuali nanti dikirim eksplisit ke provider OCR/AI (belum terjadi, lihat [08_DOCUMENT_PIPELINE](./08_DOCUMENT_PIPELINE.md)) — secara privasi ini lebih baik dibanding upload otomatis ke cloud storage.
- Tidak ada batas kuota storage browser yang ditangani secara eksplisit — kalau IndexedDB penuh (jarang terjadi untuk pemakaian wajar), belum ada penanganan error khusus di kode.

## Environment Variables

- `.env.local` (nilai asli) di-gitignore dengan benar — tidak pernah ter-commit.
- Hanya kunci **publishable/anon** Supabase yang dipakai di client (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) — kunci `service_role` (akses penuh, bypass RLS) **tidak pernah** dipakai di kode aplikasi, cuma dipakai lewat tool MCP saat development untuk mengelola skema.
- `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` masih placeholder kosong — belum ada risiko kebocoran karena belum ada kode yang membacanya. Saat diisi nanti, abstraksi provider AI sengaja ditaruh di `src/lib/ai/` (server-only) — **jangan pernah** pindahkan pemanggilan provider ke kode yang bisa jalan di client, itu akan membocorkan API key ke browser. Lihat [11_SERVICES](./11_SERVICES.md).

## Ringkasan risiko yang perlu ditindaklanjuti sebelum production

1. Nyalakan kembali `Confirm email` di Supabase (butuh provider email/SMTP sungguhan dulu — lihat [16_ROADMAP](./16_ROADMAP.md)).
2. Tambahkan pengecekan auth di route `/api/ai/*` sebelum provider AI sungguhan aktif.
3. Pertimbangkan rate limiting di route API kalau provider AI berbayar sudah aktif.
