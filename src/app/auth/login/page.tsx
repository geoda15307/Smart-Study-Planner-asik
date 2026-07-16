"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Field, Input } from "@/components/common/Form";
import { login } from "@/services/auth/authService";
import { useAppStore } from "@/store/useAppStore";

export default function LoginPage() {
  const router = useRouter();
  const authenticate = useAppStore((state) => state.authenticate);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useAppStore.persist.hasHydrated());
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace("/dashboard");
  }, [hydrated, isAuthenticated, router]);

  async function submit(loginEmail = email, loginPassword = password) {
    setLoading(true);
    setError("");
    try {
      const result = await login(loginEmail, loginPassword);
      authenticate(result.user, result.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-soft px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-2xl font-black text-white">S</div>
          <h1 className="mt-5 text-2xl font-black text-slate-900">Masuk ke Smart Study</h1>
          <p className="mt-2 text-sm text-slate-500">Login dulu untuk membuka dashboard, task, kalender, dan AI assistant.</p>
        </div>
        {error ? <p className="mt-5 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
        <div className="mt-6 space-y-4">
          <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="demo@smartstudy.app" /></Field>
          <Field label="Password"><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password123" /></Field>
          <Button className="w-full" disabled={loading} onClick={() => submit()}>{loading ? "Memvalidasi akun..." : "Login"}</Button>
          <Button className="w-full" variant="secondary" disabled={loading} onClick={() => submit("demo@smartstudy.app", "password123")}>Masuk sebagai Demo</Button>
          <Button className="w-full" variant="secondary" disabled={loading}>Login dengan Google</Button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">Belum punya akun? <Link href="/auth/register" className="font-bold text-primary-600">Daftar sekarang</Link></p>
      </Card>
    </main>
  );
}
