import { AppShell } from "@/components/layout/AppShell";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function NewTaskPage() {
  return (
    <AppShell title="New Schedule" subtitle="Tambah tugas, jadwal, atau aktivitas akademik baru.">
      <TaskForm />
    </AppShell>
  );
}
