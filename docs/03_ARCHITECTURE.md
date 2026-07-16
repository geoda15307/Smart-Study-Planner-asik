# Architecture

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

## Gambaran besar

Smart Study Planner adalah aplikasi **local-first**. Hampir seluruh data aplikasi hidup di browser pengguna (Zustand + localStorage, IndexedDB untuk file). Supabase hadir hanya sebagai penyedia identitas (Authentication) — lihat [04_AUTHENTICATION](./04_AUTHENTICATION.md) untuk kenapa keputusan ini diambil.

## Alur data lapis-per-lapis

```
UI (halaman & komponen React)
    ↓
Hooks (logika stateful yang dipakai ulang)
    ↓
Store (Zustand — satu sumber kebenaran untuk data aplikasi)
    ↓
Services (logika bisnis: auth, storage file, AI client-side)
    ↓
Lib (klien tingkat rendah: Supabase, IndexedDB, config)
    ↓
Penyimpanan / API eksternal (localStorage, IndexedDB, Supabase Auth API)
```

Catatan penting yang membedakan aplikasi ini dari arsitektur "biasa": **panah paling bawah TIDAK menuju satu backend tunggal.** Ada percabangan nyata:

```
Data Aplikasi (task, kategori, jadwal, preferensi, dll)
    Store → localStorage (lewat Zustand persist)
                    langsung, tidak lewat service/API

File yang diupload (blob)
    Hook → Service → lib/indexedDb.ts → IndexedDB

Identitas pengguna (auth, profil)
    Service → lib/supabase/client.ts → Supabase Auth API → tabel profiles
```

## Kenapa dipisah begini (bukan satu backend untuk semua)

Ini bukan kebetulan — ini keputusan arsitektur eksplisit (lihat [16_ROADMAP](./16_ROADMAP.md) untuk kronologinya): menghindari limit Supabase free tier, aplikasi tetap ringan, bisa dipakai offline, tidak bergantung koneksi internet untuk fitur inti (kelola tugas, lihat jadwal). Hanya Authentication yang **harus** online karena sifatnya (verifikasi identitas tidak bisa sepenuhnya offline).

## Auth gating: di komponen, bukan middleware

`middleware.ts` di root **ada**, tapi tugasnya cuma me-refresh cookie session Supabase — bukan memblokir akses halaman. Proteksi route yang sebenarnya ada di `AppShell.tsx` (komponen React, client-side): dia menunggu Zustand selesai hydrate, cek `isAuthenticated`, baru redirect ke `/auth/login` kalau belum login. Konsekuensinya: **setiap halaman baru yang butuh login harus dirender di dalam `<AppShell>`**, kalau tidak, halaman itu tidak terproteksi sama sekali. Detail: [04_AUTHENTICATION](./04_AUTHENTICATION.md).

## Sistem tema: CSS variable, bukan per-komponen

Alih-alih menambahkan class `dark:` di setiap komponen, warna Tailwind itu sendiri (`primary`, `slate`, `surface`, `soft`) didefinisikan ulang sebagai CSS variable di `globals.css`, di-switch lewat atribut `data-theme` dan class `.dark` pada elemen `<html>`. `useTheme()` (hook) yang menyinkronkan `preference.theme`/`preference.darkMode` dari store ke DOM. Efeknya: ganti tema/dark-mode otomatis berlaku ke **seluruh** aplikasi tanpa perlu mengedit tiap komponen satu-satu.

## Domain logic inti: `src/utils/priorityScore.ts`

Ini "jantung" aplikasi — dipakai oleh store (tiap kali task berubah), kedua API route AI, dan pengurutan task di mana-mana. Formulanya:

```
priorityScore = deadline×0.40 + priority×0.25 + difficulty×0.15 + duration×0.10 + statusRisk×0.10
```

Hasilnya di-clamp 0–100. `status === "Selesai"` selalu memaksa skor jadi 0. Kalau field yang memengaruhi formula ini berubah (misalnya `TaskStatus` diubah lagi), map di file ini **wajib** ikut diperbarui — lihat gotcha yang sama di `CLAUDE.md`.

## Konvensi tipe: satu file untuk semua

Semua interface/type domain (`Task`, `Category`, `User`, `UploadedFileMeta`, dst.) hidup di **satu file**: `src/types/index.ts`. Ini konvensi yang sudah konsisten dipakai sejak awal project — jangan membuat file tipe baru per fitur; tambahkan ke file yang sudah ada mengikuti pola yang sudah berjalan.

## Diagram alur autentikasi + data (gabungan)

```
Pengguna buka halaman
        ↓
AppShell menunggu Zustand hydrate (localStorage)
        ↓
isAuthenticated? ──No──→ redirect /auth/login
        │
       Yes
        ↓
Render halaman + data dari store (localStorage, sudah ada dari hydrate)
        ↓
Pengguna login/register?
        ↓
services/auth/authService.ts → lib/supabase/client.ts → Supabase Auth API
        ↓
Sukses → trigger DB (handle_new_user) isi tabel profiles → authService fetch profiles
        ↓
useAppStore.authenticate(user, token) → isAuthenticated = true (localStorage)
```

Untuk detail tiap tahap, lihat [04_AUTHENTICATION](./04_AUTHENTICATION.md), [06_STATE_MANAGEMENT](./06_STATE_MANAGEMENT.md), dan [12_STORES](./12_STORES.md).
