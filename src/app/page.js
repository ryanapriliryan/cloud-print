import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Printer, ShieldCheck, Calculator, FileCheck2, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin/dashboard" : "/pelanggan/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              Cloud Print
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              Sistem Layanan Percetakan Online
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              Cetak Dokumen & Media Promosi{" "}
              <span className="text-blue-600">Tanpa Antre & Bebas Virus</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Unggah file PDF atau desain cetak Anda dari mana saja, dapatkan estimasi biaya otomatis secara transparan, dan pantau progres cetak hingga siap diambil.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition"
              >
                Mulai Pesan Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 rounded-xl transition"
              >
                Masuk ke Portal
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Bebas Flashdisk & Malware</h3>
              <p className="text-sm text-slate-600">
                Pertukaran dokumen sepenuhnya berbasis cloud sehingga aman dari risiko penyebaran virus komputer.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Kalkulasi Harga Otomatis</h3>
              <p className="text-sm text-slate-600">
                Rincian biaya dokumen, banner, stiker, kartu nama, dan finishing dihitung otomatis sesuai harga master.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 sm:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Verifikasi Pembayaran & Notifikasi Real-Time</h3>
              <p className="text-sm text-slate-600">
                Unggah bukti transfer langsung di menu riwayat pesanan dan terima notifikasi instan saat cetakan selesai dikerjakan.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Cloud Print — Sistem Layanan Percetakan Online.
      </footer>
    </div>
  );
}
