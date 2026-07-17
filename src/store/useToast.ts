"use client";

import { create } from "zustand";
import { createId } from "@/utils/id";

// Toast ringan (non-persisted). Terpisah dari useAppStore karena murni UI ephemeral, bukan data
// aplikasi. Bisa dipanggil dari komponen (hook `useToast`) maupun kode non-komponen (helper
// `toast.*`, mis. dari hook useFileUpload) tanpa boilerplate context.
export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: string) => void;
}

const TOAST_TTL_MS = 3800;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (kind, message) => {
    const id = createId("toast");
    set((state) => ({ toasts: [...state.toasts, { id, kind, message }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), TOAST_TTL_MS);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}));

// Helper imperatif untuk kode di luar komponen React.
export const toast = {
  success: (message: string) => useToast.getState().push("success", message),
  error: (message: string) => useToast.getState().push("error", message),
  info: (message: string) => useToast.getState().push("info", message)
};
