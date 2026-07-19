"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { TaskCard } from "@/components/tasks/TaskCard";
import { useAppStore } from "@/store/useAppStore";
import { formatDateID, sortTasks } from "@/utils/date";

export default function DashboardPage() {
  const user = useAppStore((state) => state.user);
  const tasks = useAppStore((state) => state.tasks);
  const completeTask = useAppStore((state) => state.completeTask);
  const activeTasks = sortTasks(tasks).filter((task) => task.status !== "Selesai");
  const topTask = activeTasks[0];
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "Selesai").length;
  const pending = tasks.filter((task) => task.status !== "Selesai").length;
  const overdue = tasks.filter((task) => task.status === "Terlambat").length;

  return (
    <AppShell title="Dashboard" subtitle="Ringkasan akademik dan rekomendasi belajar hari ini.">
      <div className="space-y-5">
        <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white">
          <p className="text-xs font-black uppercase tracking-wide text-blue-100">{formatDateID(new Date())}</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">Halo, {user.name}! 👋</h2>
              <p className="mt-2 max-w-2xl text-sm text-blue-50">Kamu punya <b>{activeTasks.length}</b> tugas aktif. Mulai dari yang paling penting agar deadline tetap aman.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/tasks/new"><Button variant="secondary" className="bg-surface">Tambah Tugas</Button></Link>
              <Link href="/ai-assistant"><Button className="bg-slate-950 hover:bg-slate-800">Buka AI</Button></Link>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Total Task" value={total} icon="📌" />
          <Stat label="Selesai" value={done} icon="✅" />
          <Stat label="Pending" value={pending} icon="🕒" />
          <Stat label="Terlambat" value={overdue} icon="⚠️" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Task Prioritas</h2>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">Auto sorted</span>
            </div>
            <div className="space-y-3">
              {activeTasks.slice(0, 3).map((task) => <TaskCard key={task.id} task={task} onComplete={() => completeTask(task.id)} />)}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="border-primary-100 bg-gradient-to-br from-surface to-primary-50">
              <h3 className="font-black text-slate-900">Rekomendasi AI Hari Ini</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{topTask ? `Mulai dari “${topTask.title}” karena itu adalah tugas aktif dengan deadline terdekat.` : "Tidak ada tugas aktif."}</p>
              <p className="mt-3 text-xs text-slate-400">Rekomendasi AI dapat disesuaikan kembali oleh pengguna.</p>
            </Card>

            <Card>
              <h3 className="font-black text-slate-900">Tentang Smart Study Planner</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Smart Study Planner membantu kamu mengatur tugas kuliah, deadline, dan jadwal belajar dalam satu tempat — lengkap dengan bantuan AI untuk merangkum materi, membuat kuis, dan memberi rekomendasi prioritas.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2"><span>📌</span><span>Kelola tugas dengan prioritas otomatis</span></li>
                <li className="flex items-start gap-2"><span>🤖</span><span>AI Assistant untuk ringkasan &amp; kuis</span></li>
                <li className="flex items-start gap-2"><span>📅</span><span>Kalender & jadwal kuliah terintegrasi</span></li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-black uppercase text-slate-400">{label}</p><p className="mt-2 text-2xl font-black text-slate-900">{value}</p></div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-xl">{icon}</div>
      </div>
    </Card>
  );
}