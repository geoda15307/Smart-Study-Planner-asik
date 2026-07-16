import type { AIProvider } from "../types";

function notConfigured(): never {
  throw new Error("AI_PROVIDER=openrouter dipilih tapi OPENROUTER_API_KEY belum diisi di .env.local, atau implementasi providernya belum ditulis.");
}

export const openrouterProvider: AIProvider = {
  name: "openrouter",
  analyzeTask: notConfigured,
  chat: notConfigured,
  summarizeDocument: notConfigured
};
