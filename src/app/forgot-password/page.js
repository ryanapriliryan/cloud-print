"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Mail, Lock, AlertCircle, X, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorModalMessage(data.error || "Kredensial email atau kata sandi salah.");
        setLoading(false);
        return;
      }
      router.push(data.redirectUrl);
      router.refresh();
    } catch {
      setErrorModalMessage("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dekorasi Elemen 3D Clay Lembut di Latar Belakang */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-200/45 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-24 -right-20 w-80 h-80 rounded-full bg-sky-200/50 blur-2xl"
      />

      {/* Kartu Login Utama Claymorphism */}
      <div className="clay-card w-full max-w-md p-8 sm:p-9 relative z-10">
        <div className="flex flex-col items-center text-center mb-7">
          <Link
            href="/"
            className="clay-btn-primary w-14 h-14 flex items-center justify-center mb-4"
          >
            <Printer className="w-7 h-7" />
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Masuk ke Cloud Print
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Satu pintu masuk terpadu untuk Pelanggan dan Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Alamat Email
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="clay-btn-primary w-full py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Memverifikasi..." : "Masuk Sekarang"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="clay-card-soft mt-7 p-4 text-center text-sm text-slate-600">
          Belum memiliki akun pelanggan?{" "}
          <Link href="/register" className="font-extrabold text-indigo-600 hover:text-indigo-700">
            Daftar di sini
          </Link>
        </div>
      </div>

      {/* Modal Error Peringatan Claymorphism (Sesuai Spesifikasi Bab 2.1) */}
      {errorModalMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-card max-w-sm w-full p-7 text-center space-y-5">
            <div className="clay-btn-danger w-14 h-14 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Akses Ditolak</h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {errorModalMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setErrorModalMessage("")}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-bold text-sm shadow-[6px_8px_18px_rgba(225,29,72,0.35),inset_3px_3px_6px_rgba(255,255,255,0.4)] hover:brightness-105 active:scale-97 transition flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Tutup & Coba Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}