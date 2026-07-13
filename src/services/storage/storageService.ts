import type { Task } from "@/types";

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadCSV(filename: string, rows: Task[]) {
  const headers = ["id", "title", "courseName", "deadlineDate", "deadlineTime", "priority", "difficulty", "status", "priorityScore"];
  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => JSON.stringify(row[key as keyof Task] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
