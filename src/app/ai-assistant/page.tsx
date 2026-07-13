import { AppShell } from "@/components/layout/AppShell";
import { ChatWindow } from "@/components/ai/ChatWindow";

export default function AIAssistantPage() {
  return (
    <AppShell title="AI Assistant" subtitle="Chat akademik untuk prioritas, jadwal, ringkasan, dan tips belajar.">
      <ChatWindow />
    </AppShell>
  );
}
