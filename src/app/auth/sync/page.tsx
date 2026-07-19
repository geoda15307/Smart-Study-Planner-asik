"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import type { User } from "@/types";

export default function AuthSyncPage() {
  const router = useRouter();
  const authenticate = useAppStore((state) => state.authenticate);

  useEffect(() => {
    async function sync() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const supaUser = session.user;
        const user: User = {
          id: supaUser.id,
          name: supaUser.user_metadata?.full_name ?? supaUser.email ?? "Pengguna",
          email: supaUser.email ?? "",
          isPremium: false
        };
        authenticate(user, session.access_token);
      }

      router.replace("/dashboard");
    }
    sync();
  }, [authenticate, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">Menyelesaikan login...</p>
    </main>
  );
}