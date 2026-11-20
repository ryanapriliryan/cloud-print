import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Printer, ShieldCheck, Calculator, FileCheck2, ArrowRight, Sparkles } from "lucide-react";
import WhatsAppChatWidget from "@/components/WhatsAppChatWidget";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin/dashboard" : "/pelanggan/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Dekorasi Elemen 3D Clay Lembut di Latar Belakang */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-200/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/3 -right-24 w-96 h-96 rounded-full bg-sky-200/45 blur-3xl"
      />

      {/* Navbar Mengembang Claymorphism */}
      <header className="sticky top-0 z-20 pt-4 px-4 sm:px-6">
        <div className="clay-card max-w-6xl mx-auto px-5 sm:px-7 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="clay-btn-primary w-10 h-10 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Cloud Print
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="clay-pill px-4 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="clay-btn-primary px-5 py-2.5 text-sm font-bold"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </header>

      {/* Hero & Feature Cards */}
      <main className="flex-1 flex items-center relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-indigo-600 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Layanan Percetakan Online</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Cetak Dokumen & Media Promosi{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Tanpa Antre & Bebas Virus
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
              Unggah file PDF atau desain cetak Anda dari mana saja, dapatkan estimasi biaya otomatis secara transparan, dan pantau progres cetak hingga siap diambil.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/register"
                className="clay-btn-primary inline-flex items-center gap-2.5 px-7 py-4 text-sm sm:text-base font-bold"
              >
                Mulai Pesan Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="clay-pill inline-flex items-center gap-2 px-7 py-4 text-sm sm:text-base font-extrabold text-slate-800 hover:text-indigo-600"
              >
                Masuk ke Portal
              </Link>
            </div>
          </div>

          {/* 3 Kartu Fitur Claymorphism */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="clay-card p-6 sm:p-7 space-y-3.5 hover:-translate-y-1">
              <div className="clay-icon-box w-12 h-12 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Bebas Flashdisk & Malware
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pertukaran dokumen sepenuhnya berbasis cloud sehingga aman dari risiko penyebaran virus komputer.
              </p>
            </div>

            <div className="clay-card p-6 sm:p-7 space-y-3.5 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 flex items-center justify-center shadow-[5px_5px_12px_rgba(16,185,129,0.18),inset_3px_3px_6px_rgba(255,255,255,0.95)]">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Kalkulasi Harga Otomatis
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rincian biaya dokumen, banner, stiker, kartu nama, dan finishing dihitung otomatis sesuai harga master.
              </p>
            </div>

            <div className="clay-card p-6 sm:p-7 space-y-3.5 sm:col-span-2 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 flex items-center justify-center shadow-[5px_5px_12px_rgba(245,158,11,0.18),inset_3px_3px_6px_rgba(255,255,255,0.95)]">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Verifikasi Pembayaran & Notifikasi Real-Time
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Unggah bukti transfer langsung di menu riwayat pesanan dan terima notifikasi instan saat cetakan selesai dikerjakan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Claymorphism */}
      <footer className="pb-5 px-4 sm:px-6 relative z-10">
        <div className="clay-card-soft max-w-6xl mx-auto py-4 px-6 text-center text-xs font-bold text-slate-500">
          &copy; {new Date().getFullYear()} Cloud Print — Sistem Layanan Percetakan Online.
        </div>
      </footer>

      {/* Widget Chat WhatsApp Claymorphism */}
      <WhatsAppChatWidget />
    </div>
  );
}