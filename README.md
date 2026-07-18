# Smart Study Planner

Smart Study Planner adalah aplikasi **academic productivity assistant** berbasis AI untuk membantu mahasiswa mengatur jadwal kuliah, deadline tugas, prioritas belajar, progress akademik, dan rekomendasi rencana belajar otomatis.

Project ini dibuat sebagai **MVP mobile-first** dengan Next.js, TypeScript, Tailwind CSS, Zustand, LocalStorage, dan API route mock/fallback AI. Data dummy sudah tersedia sehingga aplikasi langsung terlihat saat dijalankan.

## Fitur MVP

- Login dan register mock.
- Onboarding 4 langkah.
- Dashboard akademik.
- Task Manager dengan tambah, hapus, tandai selesai, filter, search, sort priority.
- Form Add Task / New Schedule.
- Calendar monthly view.
- Smart Schedule Generator rule-based.
- AI Task Analysis melalui `/api/ai/analyze`.
- AI Assistant chat melalui `/api/ai/chat`.
- Progress & Analytics dengan chart.
- Category, Widget, Themes, Account, Achievement, Premium, Settings.
- Export JSON/CSV.
- UI Bahasa Indonesia, mobile-first, responsive desktop.
- Data tersimpan di LocalStorage.
- Struktur siap dikembangkan ke backend PostgreSQL dan AI API production.

## Struktur Folder

```txt
src/
  app/
    auth/login
    auth/register
    dashboard
    tasks
    tasks/new
    calendar
    ai-assistant
    progress
    category
    widget
    themes
    account
    achievement
    premium
    settings
    api/ai/analyze
    api/ai/chat
  components/
    common
    layout
    tasks
    calendar
    ai
    progress
    feature
  constants/
  hooks/
  lib/
  services/
    ai
    auth
    storage
  store/
  types/
  utils/
```

## Cara Setup di VS Code

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka:

```txt
http://localhost:3000
```

Akun demo:

```txt
Email    : demo@student.com
Password : password123
```

## Build Production

```bash
npm run build
npm run start
```

## Deployment Sederhana

1. Push ke GitHub.
2. Import repository ke Vercel.
3. Tambahkan environment variable dari `.env.example`.
4. Deploy.

## Cara Kerja AI

Frontend tidak memanggil AI provider langsung. Frontend memanggil API route internal:

```txt
POST /api/ai/analyze
POST /api/ai/chat
```

Saat ini endpoint menggunakan rule-based mock agar tetap berjalan tanpa API key. Untuk production, tambahkan OpenAI/Claude API di API route atau backend Node/Django.

## Priority Scoring

File: `src/utils/priorityScore.ts`

Formula:

```txt
priorityScore =
deadlineScore * 0.40 +
manualPriorityScore * 0.25 +
difficultyScore * 0.15 +
durationScore * 0.10 +
statusRiskScore * 0.10
```

Skor:
- 80-100: Urgent
- 60-79: High
- 40-59: Medium
- 0-39: Low

## Smart Schedule Generator

File: `src/utils/smartSchedule.ts`

Aturan:
- Task deadline terdekat dan score tinggi didahulukan.
- Task panjang dipecah menjadi sesi maksimal 90 menit.
- Jadwal mengikuti waktu produktif user.
- Task selesai tidak dijadwalkan lagi.
- AI hanya memberi saran tambahan; hasil tetap bisa diedit user.

## Tahap Pengembangan Berikutnya

- Backend Django REST/NestJS + PostgreSQL.
- JWT authentication real.
- File upload PDF/DOCX.
- AI output JSON schema validation.
- Push notification PWA.
- Google Calendar dan Google Drive sync.
- Subscription dan admin dashboard.

## Revisi v2 - Mobile & Auth Flow

Perbaikan pada versi ini:

1. Root aplikasi sekarang diarahkan ke `/auth/login`, bukan langsung ke dashboard.
2. Semua halaman utama yang memakai `AppShell` sudah dilindungi dengan pengecekan `isAuthenticated` dari Zustand persist.
3. Login/register sekarang menyimpan status auth dan mock JWT token ke store.
4. Mobile mode memiliki tombol menu lengkap (`☰`) pada header dan bottom navigation.
5. Mobile drawer menampilkan semua menu desktop: Dashboard, Tasks, Calendar, AI Assistant, Progress, Category, Widget, Themes, Achievement, Premium, Account, dan Settings.
6. Mobile header memiliki tombol back `←` pada halaman selain Dashboard.
7. Account page memiliki tombol Logout yang membersihkan token dan mengembalikan user ke halaman login.
8. Onboarding ikut dicek sesi login agar tidak bisa dibuka langsung tanpa autentikasi.

Catatan saat mencoba ulang di browser:

- Jika sebelumnya project lama pernah dibuka, hapus localStorage browser agar flow login baru terlihat bersih.
- Bisa juga buka DevTools → Application → Local Storage → hapus key `smart-study-planner-store` dan `smart-study-planner-token`.

## Deployment (Peluncuran)

Proyek **Smart Study Planner** ini telah di-deploy dan dapat diakses secara langsung (Live Preview) melalui tautan berikut:
**[https://latihan-deploy-smart-study.vercel.app]**

Aplikasi web ini diluncurkan menggunakan platform **Vercel** dengan dukungan penuh untuk arsitektur **Next.js**.

### Catatan Penting Konfigurasi Vercel
Jika anggota tim lain ingin menghubungkan *repository* ini ke akun Vercel masing-masing, pastikan untuk memperhatikan konfigurasi berikut agar tidak terjadi *error 404* (halaman tidak ditemukan):

1. **Framework Preset**: Pada menu pengaturan proyek (Settings > Build and Deployment), pastikan Framework Preset diatur ke **Next.js**.
2. **Root Directory**: Pastikan *Root Directory* diarahkan ke folder yang tepat tempat kodingan Next.js berada (misalnya: `Smart-Study-Planner-Latihan-Deploy` atau nama folder utama yang kalian sepakati). Jangan dibiarkan kosong jika *file package.json* kalian tidak berada di luar/pangkal *repository*.
3. **Environment Variables**: Jika proyek ini kedepannya menggunakan *database* (seperti Supabase) atau *API Key*, pastikan semua *key* tersebut dimasukkan ke dalam menu **Environment Variables** di Vercel agar fitur bisa berjalan di mode *Production*.
