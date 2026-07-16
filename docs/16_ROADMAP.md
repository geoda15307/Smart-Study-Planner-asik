# Roadmap

[← Kembali ke Master Index](./ALL_DOCUMENTATION.md)

Perbandingan status setiap item yang pernah direncanakan untuk project ini, berdasarkan kondisi repository saat ini — bukan asumsi.

## ✅ Selesai

| Item | Catatan |
|---|---|
| Refactor Task Card (hapus lalu kembalikan sebagian field) | Progress bar + Priority Score dikembalikan setelah sempat dihapus, atas permintaan |
| Perbaikan bug icon kategori | Kemudian dikembangkan lebih jauh (collaborator) jadi sistem Lucide icon + "Aktivitas" per kategori |
| Perbaikan sistem tema (real-time, persisten, dark mode) | Root cause: state tersimpan tapi tidak pernah diterapkan ke DOM — sudah diperbaiki dengan CSS variable |
| Redesign halaman detail task | Accent border prioritas, skor berwarna sesuai risiko, subtask progress bar |
| Penyederhanaan status task | Dari 5 status jadi 3 (`Belum Mulai`/`Selesai`/`Terlambat`) |
| CRUD subtask checklist (tambah/edit/hapus/centang) | Di form tambah task **dan** halaman detail task |
| Setup koneksi Supabase (client/server/middleware) | |
| Desain & penerapan skema database Supabase | 11 tabel — lihat status pakai/obsolete di [05_DATABASE](./05_DATABASE.md) |
| Migrasi autentikasi dari mock ke Supabase Auth sungguhan | Diverifikasi end-to-end (register → trigger DB → login → dashboard) |
| Sistem upload file lokal (drag&drop, validasi, preview, progress) | Lihat [07_UPLOAD_SYSTEM](./07_UPLOAD_SYSTEM.md) |
| Scaffolding abstraksi OCR & AI Provider (interface saja) | Lihat [08_DOCUMENT_PIPELINE](./08_DOCUMENT_PIPELINE.md), [11_SERVICES](./11_SERVICES.md) |
| Riset & rekomendasi provider AI (dokumentasi) | Rekomendasi: Google Gemini — lihat di bawah |

## 🔄 Sedang Berjalan / Sebagian

| Item | Status |
|---|---|
| AI Assistant & Calendar Assistant | Berjalan, tapi rule-based (keyword matching), bukan LLM sungguhan |
| Achievement / gamifikasi | UI dan data ada, belum ada logika unlock otomatis berdasar aktivitas pengguna |
| Widget dashboard | Ada halaman pengaturan (`WidgetPage`), tapi dashboard belum membaca pengaturan `enabled`/`size` — evaluasi widget sendiri masih **ditunda** atas permintaan eksplisit |

## ❌ Belum Dibuat

| Item | Kenapa belum |
|---|---|
| OCR (ekstraksi teks dari file yang diupload) | Sengaja ditunda — baru interface (`OCRProvider`), lihat [08_DOCUMENT_PIPELINE](./08_DOCUMENT_PIPELINE.md) |
| AI Summary dari hasil OCR (ringkasan, flashcard, quiz, rekomendasi jadwal) | Sama — baru desain tipe (`DocumentSummary`), belum ada provider yang mengisi |
| Pemanggilan provider AI sungguhan (OpenAI/Anthropic/Gemini/OpenRouter) | Menunggu keputusan final + API key. Stub sudah ada di `src/lib/ai/providers/` |
| Evaluasi widget (keep/simplify/remove) | Ditunda atas permintaan eksplisit, bukan lupa dikerjakan |
| Parsing isi file spreadsheet (XLSX/XLS/CSV) | File tersimpan mentah, isinya belum dibaca — baru relevan saat document-processing dibangun |

## 🚫 Dibatalkan

| Item | Kenapa dibatalkan | Diganti dengan |
|---|---|---|
| Migrasi seluruh data aplikasi (task, kategori, jadwal, dll) ke Supabase | Menghindari limit Supabase Free tier, jaga aplikasi tetap ringan dan bisa offline | Tetap Zustand + localStorage (+ IndexedDB untuk file) — lihat [04_AUTHENTICATION](./04_AUTHENTICATION.md), [06_STATE_MANAGEMENT](./06_STATE_MANAGEMENT.md) |
| Fitur upload pakai Supabase Storage | Konsisten dengan pembatalan di atas — Supabase hanya untuk auth | Upload lokal berbasis IndexedDB — lihat [07_UPLOAD_SYSTEM](./07_UPLOAD_SYSTEM.md) |

**Catatan penting:** migrasi data ke Supabase yang dibatalkan ini **belum pernah benar-benar dieksekusi** — baru sebatas rencana yang sempat direkomendasikan. Jadi pembatalannya tidak memerlukan "rollback" kode apapun, cuma memastikan tidak dilanjutkan.

## Rekomendasi Provider AI (riset, belum diimplementasikan)

Riset Juli 2026 (harga/limit real, bukan dari data training) untuk kebutuhan OCR + AI Summary:

| Provider | Free tier | Vision/OCR | Cocok untuk |
|---|---|---|---|
| **Google Gemini** (Gemini 3 Flash) | 1.500 req/hari, semua modalitas gratis | Native, sangat baik, PDF langsung | **Rekomendasi utama** — satu provider untuk OCR + Summary sekaligus |
| Mistral (OCR 3) | ~1B token/bulan (evaluasi) | Terbaik di kelasnya, tapi khusus OCR | Perlu dipasangkan provider lain untuk summary |
| OpenRouter | Beberapa model vision gratis, terbatas | Baik | Fleksibilitas ganti-ganti provider |
| Groq | Gratis selamanya, limit tinggi | Vision masih preview | Kecepatan, bukan OCR |
| OpenAI / Anthropic | Tidak ada free tier API berarti | Baik | Didukung di abstraksi, bukan default (karena free tier) |

Detail lengkap perbandingan: lihat riwayat di [18_CHANGELOG](./18_CHANGELOG.md) atau `Dokumentasi_yuyud27.MD` (dokumentasi sesi sebelumnya, di root project).

## Urutan Prioritas Selanjutnya (belum dieksekusi, menunggu arahan)

1. Keputusan final provider AI + API key → aktifkan `getAIProvider()` di route `/api/ai/*`.
2. Implementasi OCR sungguhan (mengisi `OCRProvider`).
3. Implementasi AI Summary sungguhan (mengisi `summarizeDocument`).
4. Evaluasi widget (saat diminta).
5. Keputusan: drop 10 tabel Supabase yang obsolete, atau biarkan (lihat [05_DATABASE](./05_DATABASE.md)).
