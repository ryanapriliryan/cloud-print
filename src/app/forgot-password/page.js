"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memulihkan kata sandi.");
      } else {
        setSuccess(data.message);
        setEmail("");
        setNewPassword("");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dekorasi Latar Lembut Claymorphism */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-200/45 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-24 -right-20 w-80 h-80 rounded-full bg-sky-200/50 blur-2xl"
      />

      <div className="clay-card w-full max-w-md p-8 sm:p-9 relative z-10">
        <div className="flex flex-col items-center text-center mb-7">
          <Link
            href="/"
            className="clay-btn-primary w-14 h-14 flex items-center justify-center mb-4"
          >
            <Printer className="w-7 h-7" />
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pemulihan Kata Sandi
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Masukkan email akun terdaftar dan atur ulang kata sandi baru Anda
          </p>
        </div>

        {error && (
          <div className="clay-btn-danger mb-5 p-3.5 text-sm font-bold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-100/85 border border-white text-emerald-800 text-sm font-bold flex items-start gap-2.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email Terdaftar
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="clay-btn-primary w-full py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Memproses..." : "Simpan Kata Sandi Baru"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="clay-card-soft mt-7 p-4 text-center text-sm text-slate-600">
          Kembali ke halaman{" "}
          <Link href="/login" className="font-extrabold text-indigo-600 hover:text-indigo-700">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}