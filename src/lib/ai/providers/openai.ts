import type { AIProvider } from "../types";

function notConfigured(): never {
  throw new Error("AI_PROVIDER=openai dipilih tapi OPENAI_API_KEY belum diisi di .env.local, atau implementasi providernya belum ditulis.");
}

export const openaiProvider: AIProvider = {
  name: "openai",
  analyzeTask: notConfigured,
  chat: notConfigured,
  summarizeDocument: notConfigured
};
