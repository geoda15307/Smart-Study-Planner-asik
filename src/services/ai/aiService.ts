import type { AIAnalysis, ChatMessage, Task } from "@/types";

async function api<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Terjadi kesalahan saat menghubungi server.");
  }

  return response.json();
}

export function analyzeTask(task: Task) {
  return api<AIAnalysis>("/api/ai/analyze", { task });
}

export function askAI(message: string, tasks: Task[], history: ChatMessage[]) {
  return api<{ reply: string }>("/api/ai/chat", { message, tasks, history });
}
