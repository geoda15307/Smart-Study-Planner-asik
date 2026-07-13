import type { Preference, StudySession, Task } from "@/types";
import { createId } from "./id";
import { sortTasks } from "./date";

const startHour = { Pagi: 8, Siang: 13, Sore: 16, Malam: 19 };

export function generateSmartSchedule(tasks: Task[], preference: Preference): StudySession[] {
  const active = sortTasks(tasks).filter((task) => task.status !== "Selesai");
  const maxMinutes = preference.maxStudyHoursPerDay * 60;
  const sessions: StudySession[] = [];
  let dayOffset = 0;
  let usedToday = 0;
  let sessionIndex = 0;

  active.forEach((task) => {
    let remaining = Math.max(30, task.estimatedDurationMinutes);
    while (remaining > 0) {
      const minutes = Math.min(90, Math.max(45, remaining));
      if (usedToday + minutes > maxMinutes) {
        dayOffset++;
        usedToday = 0;
        sessionIndex = 0;
      }

      const start = new Date();
      start.setDate(start.getDate() + dayOffset);
      start.setHours(startHour[preference.productiveTime], 0, 0, 0);
      start.setMinutes(start.getMinutes() + sessionIndex * 110);
      const end = new Date(start.getTime() + minutes * 60 * 1000);

      sessions.push({
        id: createId("session"),
        taskId: task.id,
        title: `Belajar: ${task.title}`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: "Terjadwal",
        source: "rule-based"
      });

      remaining -= minutes;
      usedToday += minutes;
      sessionIndex++;
    }
  });

  return sessions;
}
