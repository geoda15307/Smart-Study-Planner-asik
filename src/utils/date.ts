import { differenceInCalendarDays, format, isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import type { Task } from "@/types";

export function nowISO() {
  return new Date().toISOString();
}

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDateID(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "EEEE, dd MMMM yyyy", { locale: id });
}

export function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time || "23:59"}:00`);
}

export function daysUntilDeadline(task: Pick<Task, "deadlineDate">) {
  return differenceInCalendarDays(parseISO(task.deadlineDate), new Date());
}

export function isTaskOverdue(task: Pick<Task, "deadlineDate" | "deadlineTime" | "status">) {
  if (task.status === "Selesai") return false;
  return isBefore(combineDateTime(task.deadlineDate, task.deadlineTime), new Date());
}

export function deadlineLabel(task: Pick<Task, "deadlineDate" | "deadlineTime" | "status">) {
  if (task.status === "Selesai") return "Selesai";
  if (isTaskOverdue(task)) return "Terlambat";
  const date = parseISO(task.deadlineDate);
  if (isToday(date)) return "Hari ini";
  if (isTomorrow(date)) return "Besok";
  const days = differenceInCalendarDays(date, new Date());
  if (days > 0 && days <= 3) return `${days} hari lagi`;
  return format(date, "dd MMM", { locale: id });
}

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return combineDateTime(a.deadlineDate, a.deadlineTime).getTime() - combineDateTime(b.deadlineDate, b.deadlineTime).getTime();
  });
}
