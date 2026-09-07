"use client";

import { useState, FormEvent } from "react";
import { Boxes, Building2, User, Lock, Mail, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, adminName, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Gagal mendaftarkan perusahaan.");
      return;
    }

    // Company baru berstatus PENDING (lihat api/register) -> belum bisa login
    // sampai disetujui Super Admin, jadi tidak auto sign-in di sini.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-500 px-4 py-10"
        style={{
          paddingTop: "max(2.5rem, env(safe-area-inset-top))",
          paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-800">Pendaftaran terkirim</h1>
          <p className="mt-2 text-sm text-slate-500">
            Perusahaan <strong>{companyName}</strong> sedang menunggu persetujuan Super Admin. Anda akan bisa login
            dengan email <strong>{email}</strong> setelah pendaftaran disetujui.
          </p>
          <a href="/login" className="btn-primary mt-6 inline-flex w-full justify-center py-2.5">
            Kembali ke halaman login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-500 px-4 py-10"
      style={{
        paddingTop: "max(2.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mb-8 flex items-center gap-2 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <Boxes className="h-6 w-6" />
        </div>
        <span className="text-xl font-semibold tracking-tight">Inventory Dashboard</span>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-xl font-semibold text-slate-800">Daftarkan perusahaan Anda</h1>
        <p className="mt-1 text-sm text-slate-500">
          Buat ruang kerja khusus untuk perusahaan Anda — data dan user terpisah aman dari perusahaan lain.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Nama Perusahaan</label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input pl-9"
                placeholder="Contoh: Toko Berkah Jaya"
              />
            </div>
          </div>

          <div>
            <label className="label">Nama Anda (Admin Utama)</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                autoComplete="name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="input pl-9"
                placeholder="Nama lengkap Anda"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>
            <div>
              <label className="label">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  enterKeyHint="done"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="Ulangi password"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-brand-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Pendaftaran akan ditinjau Super Admin terlebih dahulu. Setelah disetujui, akun Anda otomatis mendapat
              peran <strong>Administrator</strong> dengan akses penuh, termasuk menambahkan karyawan lain sebagai
              user di modul Manajemen User.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Daftar Perusahaan
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <a href="/login" className="font-medium text-brand-600 hover:underline">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
}
