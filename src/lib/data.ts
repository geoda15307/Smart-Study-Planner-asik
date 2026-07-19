import type { Achievement, Category, ClassSchedule, Course, Preference, Task, User, WidgetPreference } from "@/types";
import { calculatePriorityScore } from "@/utils/priorityScore";
import { nowISO } from "@/utils/date";

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const demoUser: User = {
  id: "user_demo",
  name: "Mahasiswa Demo",
  email: "demo@student.com",
  isPremium: false
};

export const courses: Course[] = [
  { id: "web", name: "Pemrograman Web", color: "#2563eb", lecturerName: "Dr. Raka" },
  { id: "db", name: "Basis Data", color: "#16a34a", lecturerName: "Bu Maya" },
  { id: "ai", name: "Artificial Intelligence", color: "#7c3aed", lecturerName: "Pak Adi" },
  { id: "os", name: "Sistem Operasi", color: "#f97316", lecturerName: "Bu Nadya" },
  { id: "hci", name: "Interaksi Manusia dan Komputer", color: "#db2777", lecturerName: "Pak Bima" }
];

export const categories: Category[] = [
  { id: "kuliah", name: "Kuliah", color: "#2563eb", icon: "graduation-cap", activities: ["Pemrograman Web", "Android Development"] },
  { id: "tugas", name: "Tugas", color: "#ef4444", icon: "file-text", activities: ["Laporan", "Presentasi"] },
  { id: "belajar", name: "Belajar", color: "#7c3aed", icon: "book-open", activities: ["Belajar Mandiri"] },
  { id: "ujian", name: "Ujian", color: "#f59e0b", icon: "brain", activities: ["Quiz", "Ujian Akhir"] },
  { id: "organisasi", name: "Organisasi", color: "#0ea5e9", icon: "users", activities: ["Rapat Organisasi"] },
  { id: "exercise", name: "Exercise", color: "#22c55e", icon: "sport-shoe", activities: ["Renang", "Joging"] },
  { id: "birthday", name: "Birthday", color: "#ec4899", icon: "gift", activities: ["Rayakan Ulang Tahun"] },
  { id: "personal", name: "Personal", color: "#64748b", icon: "leaf", activities: ["Self-care"] },
  { id: "lainnya", name: "Lainnya", color: "#475569", icon: "sparkles", activities: [] }
];

const baseTasks: Omit<Task, "priorityScore">[] = [
  {
    id: "task_db_report",
    title: "Laporan Praktikum Basis Data",
    courseId: "db",
    courseName: "Basis Data",
    categoryId: "tugas",
    description: "Membuat laporan normalisasi, ERD, query SQL, dan hasil pengujian database.",
    deadlineDate: futureDate(1),
    deadlineTime: "23:59",
    priority: "Urgent",
    difficulty: "Hard",
    estimatedDurationMinutes: 240,
    status: "Belum Mulai",
    tags: ["laporan", "sql"],
    subtasks: [
      { id: "sub_db_1", title: "Selesaikan ERD", completed: false },
      { id: "sub_db_2", title: "Tulis query SQL", completed: false },
      { id: "sub_db_3", title: "Review laporan", completed: false }
    ],
    notes: "Cek format laporan dari LMS.",
    createdAt: nowISO(),
    updatedAt: nowISO()
  }
];

export const tasks: Task[] = baseTasks.map((task) => ({
  ...task,
  priorityScore: calculatePriorityScore(task)
}));

export const schedules: ClassSchedule[] = [
  { id: "schedule_web", courseName: "Pemrograman Web", day: "Senin", startTime: "09:00", endTime: "10:40", room: "Lab A", color: "#2563eb" },
  { id: "schedule_db", courseName: "Basis Data", day: "Selasa", startTime: "13:00", endTime: "14:40", room: "Ruang 204", color: "#16a34a" },
  { id: "schedule_ai", courseName: "Artificial Intelligence", day: "Rabu", startTime: "10:00", endTime: "11:40", room: "Lab AI", color: "#7c3aed" },
  { id: "schedule_os", courseName: "Sistem Operasi", day: "Kamis", startTime: "08:00", endTime: "09:40", room: "Ruang 301", color: "#f97316" }
];

export const preference: Preference = {
  theme: "Biru Akademik",
  language: "id",
  productiveTime: "Malam",
  maxStudyHoursPerDay: 3,
  defaultReminder: 1440,
  aiEnabled: true,
  notificationEnabled: true,
  darkMode: false
};

export const widgets: WidgetPreference[] = [
  { id: "widget_calendar", name: "Kalender kecil", description: "Ringkasan tanggal dan agenda dekat.", enabled: true, size: "medium" },
  { id: "widget_today", name: "Task hari ini", description: "Daftar tugas hari ini.", enabled: true, size: "large" },
  { id: "widget_progress", name: "Progress bar", description: "Progress akademik mingguan.", enabled: true, size: "medium" },
  { id: "widget_deadline", name: "Deadline terdekat", description: "Tugas dengan deadline paling dekat.", enabled: true, size: "medium" },
  { id: "widget_quote", name: "Quote motivasi", description: "Motivasi fokus belajar.", enabled: false, size: "small" },
  { id: "widget_focus", name: "Focus timer", description: "Timer belajar singkat.", enabled: false, size: "small" },
  { id: "widget_stats", name: "Statistik minggu ini", description: "Ringkasan task selesai dan pending.", enabled: true, size: "medium" },
  { id: "widget_ai", name: "AI recommendation", description: "Saran AI harian.", enabled: true, size: "large" }
];

export const achievements: Achievement[] = [
  { id: "ach_streak_3", title: "3 Hari Konsisten", description: "Belajar selama 3 hari berturut-turut.", icon: "🔥", progress: 2, target: 3, unlocked: false },
  { id: "ach_task_10", title: "10 Task Selesai", description: "Selesaikan 10 task akademik.", icon: "✅", progress: 5, target: 10, unlocked: false },
  { id: "ach_deadline_hero", title: "Deadline Hero", description: "Tidak ada deadline terlambat minggu ini.", icon: "🦸", progress: 1, target: 1, unlocked: true },
  { id: "ach_focus", title: "Focus Master", description: "Belajar 5 jam minggu ini.", icon: "⏱️", progress: 3, target: 5, unlocked: false },
  { id: "ach_planner", title: "Master Planner", description: "Buat jadwal otomatis pertama.", icon: "🏆", progress: 1, target: 1, unlocked: true }
];