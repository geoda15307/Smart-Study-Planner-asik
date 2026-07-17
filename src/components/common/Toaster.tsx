"use client";

import { CircleCheck, CircleX, Info, X } from "lucide-react";
import type { ToastKind } from "@/store/useToast";
import { useToast } from "@/store/useToast";

const config: Record<ToastKind, { icon: typeof Info; accent: string; iconClass: string }> = {
  success: { icon: CircleCheck, accent: "border-emerald-200", iconClass: "text-emerald-600" },
  error: { icon: CircleX, accent: "border-red-200", iconClass: "text-red-600" },
  info: { icon: Info, accent: "border-primary-200", iconClass: "text-primary-600" }
};

export function Toaster() {
  const toasts = useToast((state) => state.toasts);
  const dismiss = useToast((state) => state.dismiss);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:items-end lg:px-0">
      {toasts.map((item) => {
        const { icon: Icon, accent, iconClass } = config[item.kind];
        return (
          <div
            key={item.id}
            role="status"
            className={`animate-slide-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border ${accent} bg-surface px-4 py-3 shadow-soft`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${iconClass}`} />
            <p className="flex-1 text-sm font-bold text-slate-700">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
