import type { AIAnalysis, ChatMessage, Task } from "@/types";

export interface DocumentSummary {
  title: string;
  summary: string;
  keyPoints: string[];
  formulas?: string[];
  recommendedSchedule?: string[];
  flashcards?: { question: string; answer: string }[];
  quiz?: { question: string; options: string[]; correctIndex: number }[];
}

export interface AIProvider {
  name: string;
  // Matches the existing /api/ai/analyze contract (src/app/api/ai/analyze/route.ts)
  analyzeTask(task: Task): Promise<AIAnalysis>;
  // Matches the existing /api/ai/chat contract (src/app/api/ai/chat/route.ts)
  chat(message: string, tasks: Task[], history: ChatMessage[]): Promise<string>;
  // Future: OCR -> AI Summary pipeline (Upload -> OCR -> summarizeDocument -> Task/Calendar recommendation)
  summarizeDocument(input: { text?: string; imageBlob?: Blob }): Promise<DocumentSummary>;
}
