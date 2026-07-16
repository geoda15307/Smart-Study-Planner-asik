# Configuration

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

## Environment Variables

Template ada di `.env.example` (aman di-commit, tanpa nilai asli). Nilai sungguhan ada di `.env.local` (di-gitignore, tidak pernah dipush).

| Variable | Untuk apa | Status |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL` | Metadata aplikasi | Terisi, dipakai minimal |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | **Wajib diisi** — tanpa ini, auth tidak jalan |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Kunci publik Supabase (client-side, aman diekspos) | **Wajib diisi** |
| `AI_PROVIDER` | Pilih provider AI (`mock`/`openai`/`anthropic`/`gemini`/`openrouter`) | Ada, default `"mock"`, **belum dipakai** oleh route AI yang hidup — lihat [11_SERVICES](./11_SERVICES.md) |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | Kunci API provider AI | Placeholder kosong, belum dipakai kode manapun |

**Catatan penting:** `.env.example` sudah ada komentar `# Jangan expose API key di frontend` sejak awal project — ini alasan kenapa abstraksi provider AI ditaruh di `src/lib/ai/` (server-only), bukan `src/services/` yang bisa dipanggil dari client. Lihat [15_SECURITY](./15_SECURITY.md).

Belum ada `GEMINI_API_KEY`/`OPENROUTER_API_KEY` di `.env.example` — perlu ditambahkan saat provider itu benar-benar diaktifkan (lihat stub-nya di `src/lib/ai/providers/`).

## Konfigurasi Upload

`src/lib/upload/config.ts` — satu tempat untuk: `MAX_FILE_SIZE_MB` (default 10), daftar ekstensi/MIME type yang diizinkan per kategori (gambar/dokumen/spreadsheet). Sengaja dipisah jadi satu file konfigurasi tersendiri (bukan tersebar di komponen) supaya gampang diubah. Detail: [07_UPLOAD_SYSTEM](./07_UPLOAD_SYSTEM.md).

## Data Seed/Demo

`src/lib/data.ts` — semua data awal aplikasi (user demo, courses, categories, tasks contoh, schedules, preference default, widgets, achievements). Ini bukan "konfigurasi" dalam arti environment, tapi berfungsi sebagai konfigurasi konten default — dipakai saat pertama kali aplikasi dibuka (localStorage kosong) dan saat "Reset Data" dipanggil.

## Build & Tooling Configuration

| File | Untuk apa |
|---|---|
| `next.config.mjs` | Konfigurasi Next.js — minimal, belum banyak kustomisasi |
| `tsconfig.json` | TypeScript — path alias `@/*` → `./src/*`, `jsx: "preserve"` (default Next.js App Router, **jangan** diubah ke `"react-jsx"` — sempat kebawa tidak sengaja dari eksperimen upgrade Next.js 16, lihat [17_TECH_DEBT](./17_TECH_DEBT.md)) |
| `tailwind.config.ts` | Warna Tailwind (`primary`, `slate`, `surface`, `soft`) didefinisikan sebagai CSS variable, bukan hex statis — inilah yang membuat sistem tema/dark-mode bekerja lintas seluruh aplikasi tanpa mengedit tiap komponen. Detail: [03_ARCHITECTURE](./03_ARCHITECTURE.md) |
| `postcss.config.mjs` | Standar, untuk Tailwind |
| `.eslintrc.json` | **Sempat tidak ada sama sekali** di awal project (lint tidak bisa jalan) — ditambahkan belakangan (`next/core-web-vitals`) |
| `middleware.ts` (root) | Refresh cookie session Supabase di tiap request — bukan proteksi route, lihat [04_AUTHENTICATION](./04_AUTHENTICATION.md) |

## Konfigurasi Database (Supabase)

Skema database dikelola lewat migration Supabase (bukan file konfigurasi lokal), dijalankan lewat MCP tool saat development. TypeScript types hasil skema (`src/lib/supabase/database.types.ts`) **harus di-generate ulang manual** setiap skema berubah — tidak otomatis. Detail: [05_DATABASE](./05_DATABASE.md).
