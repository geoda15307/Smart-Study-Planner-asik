import { AppShell } from "@/components/layout/AppShell";
import { ChatWindow } from "@/components/ai/ChatWindow";

export default function AIAssistantPage() {
  return (
    <AppShell title="AI Assistant" subtitle="Asisten belajar pribadi untuk tugas, jadwal, dan materimu.">
      <ChatWindow />
    </AppShell>
  );
}
