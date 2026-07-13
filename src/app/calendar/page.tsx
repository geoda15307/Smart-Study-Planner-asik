"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { CalendarView } from "@/components/calendar/CalendarView";
import { useAppStore } from "@/store/useAppStore";
import { generateSmartSchedule } from "@/utils/smartSchedule";

export default function CalendarPage() {
  const tasks = useAppStore((state) => state.tasks);
  const preference = useAppStore((state) => state.preference);
  const sessions = useAppStore((state) => state.studySessions);
  const setSessions = useAppStore((state) => state.setStudySessions);

  return (
    <AppShell title="Calendar" subtitle="Monthly view, agenda harian, dan jadwal belajar otomatis.">
      <div className="space-y-5">
        <div className="flex justify-end"><Button onClick={() => setSessions(generateSmartSchedule(tasks, preference))}>Generate Jadwal Belajar</Button></div>
        <CalendarView tasks={tasks} />
        <Card>
          <h3 className="text-lg font-black text-slate-900">Jadwal Belajar Otomatis</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sessions.length ? sessions.slice(0, 8).map((session) => (
              <div key={session.id} className="rounded-2xl bg-purple-50 p-4 text-sm text-purple-900">
                <p className="font-black">{session.title}</p>
                <p className="mt-1 text-xs">{new Date(session.startTime).toLocaleString("id-ID")} - {new Date(session.endTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            )) : <p className="text-sm text-slate-500">Belum ada jadwal belajar otomatis.</p>}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
