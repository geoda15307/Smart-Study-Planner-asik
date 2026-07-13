"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/common/Card";
import { ProgressCharts } from "@/components/progress/ProgressCharts";
import { useAppStore } from "@/store/useAppStore";

export default function ProgressPage() {
  const tasks = useAppStore((state) => state.tasks);
  const done = tasks.filter((task) => task.status === "Selesai").length;
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const topCourse = Object.entries(tasks.reduce<Record<string, number>>((acc, task) => ({ ...acc, [task.courseName]: (acc[task.courseName] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  return (
    <AppShell title="Progress & Analytics" subtitle="Pantau perkembangan akademik secara visual.">
      <div className="space-y-5">
        <ProgressCharts tasks={tasks} />
        <Card>
          <h3 className="text-lg font-black text-slate-900">Insight Otomatis</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <p className="rounded-2xl bg-primary-50 p-4 text-sm font-bold text-primary-700">Kamu menyelesaikan {percent}% tugas minggu ini.</p>
            <p className="rounded-2xl bg-purple-50 p-4 text-sm font-bold text-purple-700">Mata kuliah paling banyak tugas: {topCourse}.</p>
            <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">Ada {tasks.filter((task) => task.priorityScore >= 75 && task.status !== "Selesai").length} tugas berisiko terlambat.</p>
            <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">Jam belajar paling produktif kamu adalah malam.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
