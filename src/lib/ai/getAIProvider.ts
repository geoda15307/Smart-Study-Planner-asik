import type { AIProvider } from "./types";
import { mockAIProvider } from "./providers/mock";
import { openaiProvider } from "./providers/openai";
import { anthropicProvider } from "./providers/anthropic";
import { geminiProvider } from "./providers/gemini";
import { openrouterProvider } from "./providers/openrouter";

const providers: Record<string, AIProvider> = {
  mock: mockAIProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  openrouter: openrouterProvider
};

// Not wired into src/app/api/ai/{analyze,chat}/route.ts yet — those routes keep
// their existing rule-based logic. Call this once a real provider is configured.
export function getAIProvider(): AIProvider {
  const providerName = process.env.AI_PROVIDER ?? "mock";
  return providers[providerName] ?? mockAIProvider;
}
