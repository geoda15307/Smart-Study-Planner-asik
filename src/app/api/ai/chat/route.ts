import { NextResponse } from "next/server";
import type { ChatMessage, Task } from "@/types";
import { sortTasks } from "@/utils/date";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: string; tasks?: Task[]; history?: ChatMessage[] };
    const message = body.message?.toLowerCase() ?? "";
    const tasks = body.tasks ?? [];
    const active = sortTasks(tasks).filter((task) => task.status !== "Selesai");
    const topTask = active[0];

    let reply = "Aku bisa bantu menyusun prioritas, jadwal belajar, ringkasan tugas, dan tips akademik.";

    if (message.includes("mana") || message.includes("prioritas") || message.includes("dulu")) {
      reply = topTask
        ? `Prioritas utama saat ini adalah “${topTask.title}”.\n\nAlasannya:\n- Priority score: ${topTask.priorityScore}/100\n- Deadline: ${topTask.deadlineDate} ${topTask.deadlineTime}\n- Difficulty: ${topTask.difficulty}\n\nSaran: mulai dengan membaca instruksi, pecah menjadi subtask, lalu kerjakan bagian tersulit terlebih dahulu.`
        : "Tidak ada task aktif. Kamu bisa review materi atau menyusun rencana minggu depan.";
    } else if (message.includes("jadwal")) {
      reply = topTask
        ? `Rencana belajar hari ini:\n\n1. 19.00-19.15: Review instruksi “${topTask.title}”\n2. 19.15-20.15: Kerjakan bagian utama\n3. 20.15-20.30: Istirahat\n4. 20.30-21.00: Rapikan hasil dan catat bagian yang belum selesai`
        : "Belum ada task aktif untuk dibuatkan jadwal.";
    } else if (message.includes("ringkas")) {
      reply = topTask
        ? `Ringkasan task terdekat:\n\n${topTask.title}: ${topTask.description || "Belum ada deskripsi detail."}\n\nChecklist:\n- Pahami output tugas\n- Siapkan referensi\n- Kerjakan draft\n- Review dan submit`
        : "Tidak ada task aktif yang bisa diringkas.";
    } else if (message.includes("tips")) {
      reply = "Tips agar deadline tidak terlambat:\n\n- Kerjakan task dengan deadline terdekat dulu.\n- Pecah task besar menjadi sesi 45-90 menit.\n- Sisakan minimal 1 sesi untuk review.\n- Mulai dari bagian paling kecil selama 10 menit.";
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ message: "AI sedang sibuk. Silakan coba lagi." }, { status: 500 });
  }
}
