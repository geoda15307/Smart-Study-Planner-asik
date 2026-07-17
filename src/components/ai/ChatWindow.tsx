"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CalendarClock, GraduationCap, Lightbulb, ListChecks, RotateCcw, ScrollText, Send, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { askAI } from "@/services/ai/aiService";
import { createId } from "@/utils/id";
import { nowISO } from "@/utils/date";

// Kartu prompt sederhana (bukan tombol AI besar) — ikon akademik, bukan ornamen chatbot.
const suggestions = [
  { icon: ScrollText, label: "Ringkas Materi", prompt: "Tolong ringkaskan materi dari tugas yang paling dekat deadline-nya." },
  { icon: ListChecks, label: "Buat Quiz", prompt: "Buatkan beberapa soal latihan singkat dari materi tugas saya." },
  { icon: Lightbulb, label: "Jelaskan Konsep", prompt: "Jelaskan konsep penting dari tugas yang sedang saya kerjakan." },
  { icon: BookOpen, label: "Cari Referensi", prompt: "Rekomendasikan referensi belajar untuk tugas prioritas saya." },
  { icon: CalendarClock, label: "Buat Jadwal Belajar", prompt: "Buatkan jadwal belajar untuk hari ini berdasarkan tugas saya." }
];

export function ChatWindow() {
  const tasks = useAppStore((state) => state.tasks);
  const messages = useAppStore((state) => state.chatMessages);
  const addMessage = useAppStore((state) => state.addChatMessage);
  const clear = useAppStore((state) => state.clearChatMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;
  const firstName = useMemo(() => useAppStore.getState().user.name.split(" ")[0], []);

  // Auto-scroll halus setiap ada pesan / status loading berubah.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError("");
    setLastPrompt(trimmed);
    const historySnapshot = useAppStore.getState().chatMessages;
    addMessage({ id: createId("chat"), role: "user", content: trimmed, createdAt: nowISO() });
    setInput("");
    requestAnimationFrame(autoGrow);
    setLoading(true);
    try {
      const { reply } = await askAI(trimmed, tasks, historySnapshot);
      addMessage({ id: createId("chat"), role: "assistant", content: reply, createdAt: nowISO() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI sedang tidak aktif. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter kirim, Shift+Enter baris baru.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-11rem)] max-w-3xl flex-col">
      {/* Bar tipis — hanya muncul saat sudah ada percakapan */}
      {!isEmpty ? (
        <div className="flex items-center justify-end pb-3">
          <button
            type="button"
            onClick={clear}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Bersihkan
          </button>
        </div>
      ) : null}

      {/* Area percakapan */}
      <div className="flex-1 overflow-y-auto rounded-card border border-slate-100 bg-surface p-4 sm:p-6">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 text-primary-600">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">Halo, {firstName}. Mulai belajar dengan bantuan AI.</h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Pilih salah satu di bawah, atau ketik pertanyaanmu sendiri.
            </p>
            <div className="mt-6 grid w-full max-w-xl grid-cols-2 gap-2 sm:grid-cols-3">
              {suggestions.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => send(prompt)}
                  className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-primary-200 hover:bg-primary-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface text-primary-600 shadow-sm transition group-hover:bg-primary-600 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-700">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`animate-fade-up max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-br-md bg-primary-600 font-medium text-white"
                      : "rounded-bl-md bg-slate-50 text-slate-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-slate-50 px-4 py-3">
                  <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                  <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                  <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {error ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">
          <span className="min-w-0 flex-1 truncate">{error}</span>
          <button type="button" onClick={() => send(lastPrompt)} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs hover:bg-red-200">
            <RotateCcw className="h-3.5 w-3.5" /> Coba lagi
          </button>
        </div>
      ) : null}

      {/* Input — compact, multi-line, Enter kirim / Shift+Enter baris baru */}
      <div className="mt-3">
        <div className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-surface p-2 pl-4 transition focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
          <textarea
            ref={textareaRef}
            value={input}
            rows={1}
            onChange={(event) => {
              setInput(event.target.value);
              autoGrow();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pertanyaan akademik..."
            className="max-h-[168px] flex-1 resize-none border-none bg-transparent py-2.5 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Kirim"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 px-1 text-center text-[11px] text-slate-400">
          Enter untuk kirim · Shift + Enter untuk baris baru
        </p>
      </div>
    </div>
  );
}
