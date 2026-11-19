"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, User, Mail, Phone, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mendaftarkan akun.");
        setLoading(false);
        return;
      }
      router.push(data.redirectUrl);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
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
            Buat Akun Pelanggan
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Daftar untuk mulai memesan layanan cetak secara online
          </p>
        </div>

        {error && (
          <div className="clay-btn-danger mb-5 p-3.5 text-sm font-bold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama lengkap Anda"
                className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
                className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="clay-card-soft mt-7 p-4 text-center text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-extrabold text-indigo-600 hover:text-indigo-700">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}