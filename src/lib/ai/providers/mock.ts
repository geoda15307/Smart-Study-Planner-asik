import type { AIProvider } from "../types";

export const mockAIProvider: AIProvider = {
  name: "mock",
  async analyzeTask(task) {
    return {
      id: `ai_mock_${Date.now()}`,
      taskId: task.id,
      summary: `Tugas "${task.title}" (provider AI belum dikonfigurasi).`,
      recommendedPriority: task.priority,
      reason: "Provider AI belum dikonfigurasi — atur AI_PROVIDER di .env.local.",
      steps: [],
      tips: [],
      estimatedDurationMinutes: task.estimatedDurationMinutes,
      riskLevel: "low",
      createdAt: new Date().toISOString()
    };
  },
  async chat() {
    return "Provider AI belum dikonfigurasi.";
  },
  async summarizeDocument() {
    return {
      title: "Belum tersedia",
      summary: "Provider AI belum dikonfigurasi.",
      keyPoints: []
    };
  }
};
