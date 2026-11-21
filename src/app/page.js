import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ArrowRight } from "lucide-react";
import LiveChatWidget from "@/components/LiveChatWidget";

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
        className="pointer-events-none fixed -top-24 -left-24 w-80 h-80 rounded-full bg-blue-300/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/3 -right-24 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl"
      />

      {/* Navbar Mengembang Claymorphism */}
      <header className="sticky top-0 z-20 pt-4 px-4 sm:px-6">
        <div className="clay-card max-w-6xl mx-auto px-5 sm:px-7 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="clay-btn-primary w-10 h-10 flex items-center justify-center shrink-0">
              <span
                role="img"
                aria-label="Printer"
                className="text-xl leading-none drop-shadow-[0_3px_4px_rgba(15,23,42,0.3)] select-none"
              >
                🖨️
              </span>
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Cloud Print
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="clay-card-soft rounded-full px-4 py-2 text-sm font-bold text-slate-700 hover:text-cobalt transition"
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
            <div className="clay-card-soft rounded-full inline-flex items-center gap-2 px-4 py-1.5 text-cobalt text-xs font-extrabold">
              <span
                role="img"
                aria-label="Sparkles"
                className="text-sm leading-none drop-shadow-[0_2px_2px_rgba(15,23,42,0.18)] select-none"
              >
                ✨
              </span>
              <span>Sistem Layanan Percetakan Online</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Cetak Dokumen & Media Promosi{" "}
              <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-amber-500 bg-clip-text text-transparent">
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
                className="clay-card-soft rounded-full inline-flex items-center gap-2 px-7 py-4 text-sm sm:text-base font-extrabold text-slate-800 hover:text-cobalt transition"
              >
                Masuk ke Portal
              </Link>
            </div>
          </div>

          {/* 3 Kartu Fitur Claymorphism dengan Ikon 3D Emoji */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="clay-card p-6 sm:p-7 space-y-3.5 hover:-translate-y-1">
              <div className="clay-icon-box icon-emerald w-13 h-13 w-12 h-12 flex items-center justify-center">
                <span
                  role="img"
                  aria-label="Perisai Keamanan"
                  className="text-2xl leading-none drop-shadow-[0_4px_5px_rgba(6,95,70,0.28)] select-none"
                >
                  🛡️
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Bebas Flashdisk & Malware
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pertukaran dokumen sepenuhnya berbasis cloud sehingga aman dari risiko penyebaran virus komputer.
              </p>
            </div>

            <div className="clay-card p-6 sm:p-7 space-y-3.5 hover:-translate-y-1">
              <div className="clay-icon-box icon-tangerine w-12 h-12 flex items-center justify-center">
                <span
                  role="img"
                  aria-label="Kalkulator Harga"
                  className="text-2xl leading-none drop-shadow-[0_4px_5px_rgba(180,83,9,0.28)] select-none"
                >
                  🧮
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Kalkulasi Harga Otomatis
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rincian biaya dokumen, banner, stiker, kartu nama, dan finishing dihitung otomatis sesuai harga master.
              </p>
            </div>

            <div className="clay-card p-6 sm:p-7 space-y-3.5 sm:col-span-2 hover:-translate-y-1">
              <div className="clay-icon-box icon-cobalt w-12 h-12 flex items-center justify-center">
                <span
                  role="img"
                  aria-label="Struk dan Notifikasi"
                  className="text-2xl leading-none drop-shadow-[0_4px_5px_rgba(29,78,216,0.28)] select-none"
                >
                  🧾
                </span>
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
        <div className="clay-card-soft max-w-6xl mx-auto py-4 px-6 text-center text-xs font-bold text-slate-600">
          &copy; {new Date().getFullYear()} Cloud Print — Sistem Layanan Percetakan Online.
        </div>
      </footer>

      {/* Widget Live Chat Internal Claymorphism */}
      <LiveChatWidget />
    </div>
  );
}