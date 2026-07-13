"use client";

import { useMemo, useState } from "react";
import type { Priority, Task, TaskStatus } from "@/types";
import { daysUntilDeadline, sortTasks } from "@/utils/date";

export function useTaskFilters(tasks: Task[]) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "Semua">("Semua");
  const [priority, setPriority] = useState<Priority | "Semua">("Semua");
  const [range, setRange] = useState<"Semua" | "Hari ini" | "Minggu ini" | "Bulan ini">("Semua");

  const filteredTasks = useMemo(() => {
    return sortTasks(tasks).filter((task) => {
      const keyword = `${task.title} ${task.courseName} ${task.description} ${task.notes ?? ""}`.toLowerCase();
      const days = daysUntilDeadline(task);
      const rangeMatch =
        range === "Semua" ||
        (range === "Hari ini" && days === 0) ||
        (range === "Minggu ini" && days >= 0 && days <= 7) ||
        (range === "Bulan ini" && days >= 0 && days <= 31);

      return keyword.includes(search.toLowerCase())
        && (status === "Semua" || task.status === status)
        && (priority === "Semua" || task.priority === priority)
        && rangeMatch;
    });
  }, [tasks, search, status, priority, range]);

  return { search, setSearch, status, setStatus, priority, setPriority, range, setRange, filteredTasks };
}
