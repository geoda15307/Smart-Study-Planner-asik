import { NextResponse } from "next/server";
import type { AIAnalysis, Task } from "@/types";
import { createId } from "@/utils/id";
import { nowISO } from "@/utils/date";
import { riskLevel, scoreToPriority } from "@/utils/priorityScore";

export async function POST(request: Request) {
  try {
    const { task } = (await request.json()) as { task?: Task };

    if (!task?.title || !task.deadlineDate) {
      return NextResponse.json({ message: "Data task belum lengkap." }, { status: 400 });
    }

    const risk = riskLevel(task.priorityScore);
    const recommendedPriority = scoreToPriority(task.priorityScore);

    const analysis: AIAnalysis = {
      id: createId("ai"),
      taskId: task.id,
      summary: `Tugas “${task.title}” perlu dikerjakan dengan prioritas ${recommendedPriority}.`,
      recommendedPriority,
      reason: `Sistem menilai deadline, priority manual, difficulty, durasi, dan status task. Priority score saat ini adalah ${task.priorityScore}/100.`,
      steps: [
        "Baca ulang instruksi tugas dan tandai bagian wajib dikumpulkan.",
        "Pecah tugas menjadi subtask kecil.",
        "Kerjakan bagian tersulit terlebih dahulu.",
        "Sisakan waktu untuk review, revisi, dan submit."
      ],
      tips: [
        "Gunakan sesi belajar 45-90 menit agar tetap fokus.",
        "Aktifkan reminder H-1 untuk menghindari submit terlambat.",
        "Tulis pertanyaan jika ada bagian instruksi yang belum jelas."
      ],
      estimatedDurationMinutes: Math.max(task.estimatedDurationMinutes, 60),
      riskLevel: risk,
      warning: risk === "high" ? "Deadline tugas ini berisiko terlambat. Mulai kerjakan hari ini dan pecah menjadi beberapa sesi." : undefined,
      createdAt: nowISO()
    };

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ message: "Analisis AI gagal. Silakan coba lagi." }, { status: 500 });
  }
}
