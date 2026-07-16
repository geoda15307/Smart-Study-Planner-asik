import type { AIProvider } from "../types";

function notConfigured(): never {
  throw new Error("AI_PROVIDER=gemini dipilih tapi GEMINI_API_KEY belum diisi di .env.local, atau implementasi providernya belum ditulis.");
}

export const geminiProvider: AIProvider = {
  name: "gemini",
  analyzeTask: notConfigured,
  chat: notConfigured,
  summarizeDocument: notConfigured
};
