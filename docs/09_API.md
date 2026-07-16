# API

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

## Ringkasan

Aplikasi ini **hanya** punya 2 API route internal — keduanya di `src/app/api/ai/`. Tidak ada endpoint lain (tidak ada `/api/tasks`, `/api/upload`, dll — karena semua data aplikasi diakses langsung dari Zustand di sisi klien, tanpa lewat API, kecuali AI yang memang butuh eksekusi server-side).

Kedua route ini **rule-based**, bukan pemanggilan LLM sungguhan — lihat [16_ROADMAP](./16_ROADMAP.md) untuk rencana mengaktifkan AI sungguhan.

## `POST /api/ai/analyze`

**Tujuan:** menghasilkan "analisis AI" untuk satu task (dipanggil dari tombol "Analisis AI" di halaman detail task dan form tambah task).

| | |
|---|---|
| **Input** | `{ task: Task }` (task lengkap dari klien, termasuk `priorityScore` yang sudah dihitung) |
| **Output** | `AIAnalysis` — `{ id, taskId, summary, recommendedPriority, reason, steps[], tips[], estimatedDurationMinutes, riskLevel, warning?, createdAt }` |
| **Validasi** | Tolak (400) kalau `task.title` atau `task.deadlineDate` kosong |
| **Logika** | `riskLevel()` dan `scoreToPriority()` dari `utils/priorityScore.ts` — **bukan** panggilan AI, murni turunan dari `priorityScore` yang sudah ada. `steps`/`tips` adalah teks statis yang sama untuk semua task. `warning` hanya muncul kalau `riskLevel === "high"`. |
| **Dependensi** | `utils/id.ts` (`createId`), `utils/date.ts` (`nowISO`), `utils/priorityScore.ts` |

## `POST /api/ai/chat`

**Tujuan:** balasan chat untuk AI Assistant.

| | |
|---|---|
| **Input** | `{ message?: string, tasks?: Task[], history?: ChatMessage[] }` |
| **Output** | `{ reply: string }` |
| **Logika** | `message.toLowerCase()` dicocokkan dengan keyword (`includes`) — "mana"/"prioritas"/"dulu" → jawaban soal prioritas; "jadwal" → rencana harian statis; "ringkas" → ringkasan task teratas; "tips" → tips generik. Kalau tidak cocok keyword apapun, balasan default generik. `history` diterima tapi **tidak dipakai** untuk memengaruhi jawaban (tidak ada konteks percakapan sungguhan). |
| **Dependensi** | `utils/date.ts` (`sortTasks` — untuk menentukan task prioritas teratas) |

## Kontrak yang harus dijaga kalau AI diaktifkan sungguhan

Client (`src/services/ai/aiService.ts`) memanggil kedua route ini lewat `fetch` biasa dan mengharapkan bentuk response persis seperti di atas. Rencana mengaktifkan AI sungguhan (lihat `src/lib/ai/types.ts`, dijelaskan di [11_SERVICES](./11_SERVICES.md)) sengaja dirancang supaya **kontrak input/output route ini tidak berubah** — hanya logika di dalam route yang diganti dari rule-based menjadi pemanggilan provider AI sungguhan.

## Kenapa tidak ada API route untuk data lain (task, kategori, dll)

Karena data aplikasi tidak melewati server sama sekali — komponen React langsung baca/tulis ke Zustand store (yang persist ke localStorage). Ini konsisten dengan keputusan arsitektur "local-first" di [03_ARCHITECTURE](./03_ARCHITECTURE.md). Kalau data-layer suatu saat dipindah ke backend sungguhan, di sinilah API route baru (`/api/tasks`, dst.) akan ditambahkan — belum ada rencana konkret untuk ini (lihat [16_ROADMAP](./16_ROADMAP.md), keputusan saat ini justru sebaliknya: tetap lokal).
