"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { PriorityBadge, StatusBadge } from "@/components/common/Badge";
import { useAppStore } from "@/store/useAppStore";
import { analyzeTask } from "@/services/ai/aiService";
import { deadlineLabel } from "@/utils/date";

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const task = useAppStore((state) => state.tasks.find((item) => item.id === params.id));
  const updateTask = useAppStore((state) => state.updateTask);
  const completeTask = useAppStore((state) => state.completeTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!task) return <AppShell title="Task tidak ditemukan"><Card>Task tidak ditemukan.</Card></AppShell>;

  async function runAI() {
    setLoading(true);
    setError("");
    try {
      const analysis = await analyzeTask(task);
      updateTask(task.id, { aiAnalysis: analysis });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analisis AI gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Detail Task" subtitle="Lihat informasi task, subtask, dan hasil analisis AI.">
      <div className="space-y-5">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap gap-2"><PriorityBadge priority={task.priority} /><StatusBadge status={task.status} /></div>
              <h2 className="mt-4 text-2xl font-black text-slate-900">{task.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{task.courseName} • Deadline {deadlineLabel(task)} pukul {task.deadlineTime}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-black uppercase text-slate-400">Priority Score</p>
              <p className="text-3xl font-black text-slate-900">{task.priorityScore}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">{task.description || "Belum ada deskripsi tugas."}</p>
          {task.notes ? <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Catatan: {task.notes}</p> : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={runAI} disabled={loading}>{loading ? "AI memproses..." : "Analisis AI"}</Button>
            <Button variant="secondary" onClick={() => completeTask(task.id)} disabled={task.status === "Selesai"}>Tandai Selesai</Button>
            <Button variant="danger" onClick={() => { if (confirm("Hapus task ini?")) { deleteTask(task.id); router.push("/tasks"); } }}>Hapus</Button>
          </div>
          {error ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
        </Card>

        <Card>
          <h3 className="text-lg font-black text-slate-900">Subtask</h3>
          <div className="mt-4 space-y-2">
            {task.subtasks.length ? task.subtasks.map((subtask) => (
              <div key={subtask.id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{subtask.completed ? "✅" : "⬜"} {subtask.title}</div>
            )) : <p className="text-sm text-slate-500">Belum ada subtask.</p>}
          </div>
        </Card>

        {task.aiAnalysis ? (
          <Card className="border-primary-100 bg-primary-50/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-primary-600">Hasil Analisis AI</p>
                <h3 className="mt-1 text-lg font-black text-slate-900">{task.aiAnalysis.summary}</h3>
              </div>
              <PriorityBadge priority={task.aiAnalysis.recommendedPriority} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{task.aiAnalysis.reason}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div><h4 className="font-bold text-slate-900">Langkah pengerjaan</h4><ol className="mt-2 space-y-2 text-sm text-slate-600">{task.aiAnalysis.steps.map((step, i) => <li key={step}>{i + 1}. {step}</li>)}</ol></div>
              <div><h4 className="font-bold text-slate-900">Tips belajar</h4><ul className="mt-2 space-y-2 text-sm text-slate-600">{task.aiAnalysis.tips.map((tip) => <li key={tip}>• {tip}</li>)}</ul></div>
            </div>
            {task.aiAnalysis.warning ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{task.aiAnalysis.warning}</p> : null}
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
