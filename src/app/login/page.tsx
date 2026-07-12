"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Boxes, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@toko.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email atau password salah.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-500 px-4 py-10">
      <div className="mb-8 flex items-center gap-2 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <Boxes className="h-6 w-6" />
        </div>
        <span className="text-xl font-semibold tracking-tight">Inventory Dashboard</span>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-xl font-semibold text-slate-800">Masuk ke akun Anda</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola master barang, pengadaan dan penjualan dalam satu dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                enterKeyHint="next"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9"
                placeholder="nama@perusahaan.com"
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                enterKeyHint="done"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Masuk
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-600">Akun demo:</p>
          <p>admin@toko.com — Administrator</p>
          <p>manager@toko.com — Manajer</p>
          <p>staff@toko.com — Staff (password: password123)</p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Perusahaan Anda belum terdaftar?{" "}
          <a href="/register" className="font-medium text-brand-600 hover:underline">
            Daftarkan perusahaan
          </a>
        </p>
      </div>
    </div>
  );
}
