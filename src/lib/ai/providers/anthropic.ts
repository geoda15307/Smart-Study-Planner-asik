import type { AIProvider } from "../types";

function notConfigured(): never {
  throw new Error("AI_PROVIDER=anthropic dipilih tapi ANTHROPIC_API_KEY belum diisi di .env.local, atau implementasi providernya belum ditulis.");
}

export const anthropicProvider: AIProvider = {
  name: "anthropic",
  analyzeTask: notConfigured,
  chat: notConfigured,
  summarizeDocument: notConfigured
};
