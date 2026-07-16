import type { User } from "@/types";
import { createClient } from "@/lib/supabase/client";

function translateAuthError(message: string) {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email atau password salah.",
    "User already registered": "Email sudah terdaftar. Silakan login.",
    "Email not confirmed": "Email belum dikonfirmasi. Cek inbox kamu untuk link konfirmasi.",
    "Password should be at least 6 characters": "Password minimal 6 karakter."
  };
  return map[message] ?? message;
}

export async function login(email: string, password: string) {
  if (!email || !password) throw new Error("Email dan password wajib diisi.");
  if (!email.includes("@")) throw new Error("Format email tidak valid.");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateAuthError(error.message));

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();

  const user: User = {
    id: data.user.id,
    name: profile?.name || data.user.email!.split("@")[0],
    email: data.user.email!,
    university: profile?.university ?? "",
    major: profile?.major ?? "",
    semester: profile?.semester ?? 1,
    isPremium: profile?.is_premium ?? false
  };

  return { token: data.session.access_token, user };
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  university: string;
  major: string;
  semester: number;
}) {
  if (!input.name.trim()) throw new Error("Nama tidak boleh kosong.");
  if (!input.email.includes("@")) throw new Error("Email wajib valid.");
  if (input.password.length < 8) throw new Error("Password minimal 8 karakter.");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
        university: input.university || null,
        major: input.major || null,
        semester: input.semester
      }
    }
  });
  if (error) throw new Error(translateAuthError(error.message));

  const user: User = {
    id: data.user!.id,
    name: input.name,
    email: input.email,
    university: input.university || "Belum diisi",
    major: input.major || "Belum diisi",
    semester: input.semester,
    isPremium: false
  };

  // data.session is null when the project requires email confirmation —
  // the account exists but can't log in yet until the link is clicked.
  return { token: data.session?.access_token ?? null, user, needsEmailConfirmation: !data.session };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
