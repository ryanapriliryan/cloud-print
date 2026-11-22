import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  Printer,
  ShieldCheck,
  Calculator,
  FileCheck2,
  ArrowRight,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Tag,
  CreditCard,
  BookOpen,
  UploadCloud,
  CheckCircle2,
  Clock,
  MapPin,
  HelpCircle,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import LiveChatWidget from "@/components/LiveChatWidget";

const SERVICES = [
  {
    title: "Dokumen & Kertas",
    price: "Mulai Rp 500 / lembar",
    desc: "Cetak laporan, skripsi, modul, proposal, hingga brosur ukuran A4, F4, dan A3 hitam-putih maupun full color.",
    icon: FileText,
    iconBoxClass: "icon-sapphire",
  },
  {
    title: "Banner & Spanduk",
    price: "Mulai Rp 25.000 / meter",
    desc: "Cetak indoor maupun outdoor bahan Flexi China, Korea, hingga Albatros + Laminasi dengan ukuran kustom.",
    icon: ImageIcon,
    iconBoxClass: "icon-amber",
  },
  {
    title: "Stiker & Label",
    price: "Mulai Rp 8.000 / lembar A3+",
    desc: "Stiker Chromo, Vinyl tahan air, dan Transparan lengkap dengan opsi potong kiss-cut atau die-cut presisi.",
    icon: Tag,
    iconBoxClass: "icon-jade",
  },
  {
    title: "Kartu Nama",
    price: "Mulai Rp 35.000 / box",
    desc: "Cetak kartu nama profesional bahan Art Carton 260gsm–310gsm satu atau dua sisi dengan laminasi doff/glossy.",
    icon: CreditCard,
    iconBoxClass: "icon-ruby",
  },
  {
    title: "Buku & Majalah",
    price: "Mulai Rp 15.000 / eksemplar",
    desc: "Cetak buku panduan, katalog produk, majalah, dan portofolio lengkap dengan jilid spiral, steples tengah, atau lem panas.",
    icon: BookOpen,
    iconBoxClass: "icon-sapphire",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Pilih Layanan & Unggah File",
    desc: "Tentukan kategori cetak, ukuran, jumlah, serta opsi finishing lalu unggah dokumen siap cetak Anda.",
    icon: UploadCloud,
    iconBoxClass: "icon-sapphire",
  },
  {
    step: "02",
    title: "Kalkulasi Harga Otomatis",
    desc: "Sistem menghitung total biaya cetak dan finishing secara transparan sesuai daftar harga master.",
    icon: Calculator,
    iconBoxClass: "icon-amber",
  },
  {
    step: "03",
    title: "Transfer & Kirim Bukti Bayar",
    desc: "Lakukan pembayaran sesuai nominal tagihan dan unggah foto bukti transfer langsung dari menu riwayat.",
    icon: ShieldCheck,
    iconBoxClass: "icon-ruby",
  },
  {
    step: "04",
    title: "Produksi & Siap Diambil",
    desc: "Pantau progres produksi secara real-time hingga muncul notifikasi pesanan selesai dan siap diambil.",
    icon: CheckCircle2,
    iconBoxClass: "icon-jade",
  },
];

const FAQS = [
  {
    q: "Berapa lama proses pengerjaan pesanan cetak?",
    a: "Pesanan dokumen reguler umumnya selesai dalam 1–3 jam kerja setelah pembayaran terverifikasi. Untuk banner ukuran besar atau jilid buku jumlah banyak membutuhkan waktu 1 hari kerja.",
  },
  {
    q: "Format file apa saja yang didukung oleh sistem?",
    a: "Sistem menerima file berformat PDF, PNG, dan JPG dengan ukuran maksimal 4,5 MB per file agar proses unggah dan pratinjau berjalan cepat.",
  },
  {
    q: "Bagaimana cara mengetahui pesanan saya sudah selesai dicetak?",
    a: "Anda akan menerima notifikasi langsung pada ikon lonceng di dasbor pelanggan, dan status di halaman Riwayat Pesanan otomatis berubah menjadi 'Siap Diambil'.",
  },
  {
    q: "Bagaimana jika bukti transfer saya ditolak oleh Admin?",
    a: "Anda dapat melihat alasan penolakan secara jelas pada kartu pesanan di menu Riwayat Pesanan, lalu mengunggah ulang foto bukti transfer yang sesuai tanpa perlu membuat pesanan baru.",
  },
];

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin/dashboard" : "/pelanggan/dashboard");
  }

  return (
    <div id="top" className="min-h-screen flex flex-col relative overflow-x-clip">
      {/* Navbar Mengembang Mengikuti Saat Di-Scroll */}
      <header className="fixed top-0 inset-x-0 z-30 pt-3.5 px-4 sm:px-6">
        <div className="clay-card max-w-6xl mx-auto px-5 sm:px-7 h-16 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 shrink-0 cursor-pointer">
            <div className="clay-btn-primary w-10 h-10 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
                Cloud Print
              </span>
              <span className="text-[11px] font-bold text-indigo-600 hidden sm:block mt-0.5">
                Layanan Percetakan Online
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1.5 text-sm font-bold">
            <a href="#layanan" className="clay-nav-link">
              Layanan & Harga
            </a>
            <a href="#cara-pesan" className="clay-nav-link">
              Cara Pesan
            </a>
            <a href="#ketentuan" className="clay-nav-link">
              Ketentuan File
            </a>
            <a href="#faq" className="clay-nav-link">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/login"
              className="clay-pill px-4 py-2 text-xs sm:text-sm font-bold"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="clay-btn-primary px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </header>

      {/* Konten Utama Beranda (pt-24 memberi ruang untuk Navbar Fixed di atas) */}
      <main className="flex-1 relative z-10 pt-24 sm:pt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
          {/* =========================================================
              1. Hero & Kartu Pratinjau Ringkas (Tanpa Pengulangan Teks)
             ========================================================= */}
          <section className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="clay-pill inline-flex items-center gap-2 px-4 py-1.5 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sistem Layanan Percetakan Online</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                Cetak Dokumen & Media Promosi{" "}
                <span className="text-indigo-600">
                  Tanpa Antre & Bebas Virus
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                Unggah file PDF atau desain cetak Anda dari mana saja, dapatkan estimasi biaya otomatis secara transparan, dan pantau progres cetak hingga siap diambil.
              </p>

              <div className="flex flex-wrap gap-4 pt-1">
                <Link
                  href="/register"
                  className="clay-btn-primary inline-flex items-center gap-2.5 px-7 py-4 text-sm sm:text-base font-bold"
                >
                  Mulai Pesan Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="clay-pill inline-flex items-center gap-2 px-7 py-4 text-sm sm:text-base font-extrabold"
                >
                  Masuk ke Portal
                </Link>
              </div>
            </div>

            {/* 1 Kartu Pratinjau Visual Ringkas di Samping Judul */}
            <div className="lg:col-span-5">
              <div className="clay-card p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="clay-icon-box icon-jade w-11 h-11 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900">
                        100% Cloud & Bebas Malware
                      </h2>
                      <p className="text-xs text-slate-500">
                        Tanpa perlu colok flashdisk di lokasi
                      </p>
                    </div>
                  </div>
                  <span className="clay-badge clay-badge-done px-3 py-1 text-[11px] font-extrabold">
                    Siap Diambil
                  </span>
                </div>

                {/* Simulasi Ringkas Kartu Order */}
                <div className="clay-card-soft p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">
                      CP-20261122-0842
                    </span>
                    <span className="font-bold text-indigo-600">
                      Estimasi Otomatis
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <FileCheck2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Laporan_Skripsi_Final.pdf • A4 + Jilid</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="clay-pill py-1.5 px-2 text-[11px] font-extrabold">
                      5 Kategori
                    </div>
                    <div className="clay-pill py-1.5 px-2 text-[11px] font-extrabold">
                      Maks 4,5 MB
                    </div>
                    <div className="clay-pill py-1.5 px-2 text-[11px] font-extrabold">
                      Real-Time
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center font-medium">
                  Gulir ke bawah untuk melihat daftar harga mulai, alur pemesanan, dan panduan file siap cetak.
                </p>
              </div>
            </div>
          </section>

          {/* =========================================================
              2. Katalog Layanan & Estimasi Harga
             ========================================================= */}
          <section id="layanan" className="space-y-5 scroll-mt-24">
            <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Katalog Layanan & Estimasi Harga
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Pilih berbagai kebutuhan cetak digital dengan pilihan bahan dan finishing lengkap.
                </p>
              </div>
              <Link
                href="/login"
                className="clay-pill px-4 py-2.5 text-xs font-extrabold self-start sm:self-auto"
              >
                Hitung Harga Spesifik →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    className="clay-card p-6 flex flex-col justify-between space-y-4 hover:-translate-y-1"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`clay-icon-box ${service.iconBoxClass} w-12 h-12 flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="clay-pill px-3 py-1 text-[11px] font-extrabold">
                          {service.price}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 pt-1">
                        {service.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {service.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600">
                        Tersedia Online
                      </span>
                      <Link
                        href="/login"
                        className="text-xs font-extrabold text-indigo-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Pesan Sekarang</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =========================================================
              3. Alur Pemesanan Mudah dalam 4 Langkah
             ========================================================= */}
          <section id="cara-pesan" className="clay-card p-6 sm:p-8 space-y-6 scroll-mt-24">
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <h2 className="text-xl font-black text-slate-900">
                Alur Pemesanan Mudah dalam 4 Langkah
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Seluruh proses pemesanan hingga konfirmasi pembayaran dilakukan dalam satu akun terpadu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="clay-card-soft p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`clay-icon-box ${item.iconBoxClass} w-11 h-11 flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-black text-indigo-600 opacity-85">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =========================================================
              4. Panduan File Siap Cetak & Informasi Operasional
             ========================================================= */}
          <section
            id="ketentuan"
            className="grid grid-cols-1 lg:grid-cols-5 gap-6 scroll-mt-24"
          >
            {/* Panduan File (3 Kolom) */}
            <div className="lg:col-span-3 clay-card p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="clay-icon-box icon-amber w-11 h-11 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Panduan File Siap Cetak
                  </h2>
                  <p className="text-xs text-slate-600">
                    Pastikan dokumen memenuhi standar berikut agar hasil cetak tajam dan bebas revisi.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="clay-card-soft p-4 space-y-1">
                  <p className="font-extrabold text-slate-900">Format & Kapasitas Unggah</p>
                  <p className="text-slate-600 leading-relaxed">
                    Gunakan format <strong>PDF, PNG, atau JPG</strong> dengan ukuran maksimal{" "}
                    <strong>4,5 MB</strong> per file.
                  </p>
                </div>

                <div className="clay-card-soft p-4 space-y-1">
                  <p className="font-extrabold text-slate-900">Resolusi Gambar Tajam</p>
                  <p className="text-slate-600 leading-relaxed">
                    Disarankan resolusi minimal <strong>300 DPI</strong> untuk dokumen/stiker dan{" "}
                    <strong>150 DPI</strong> untuk banner skala meter.
                  </p>
                </div>

                <div className="clay-card-soft p-4 space-y-1">
                  <p className="font-extrabold text-slate-900">Margin Aman & Bleed</p>
                  <p className="text-slate-600 leading-relaxed">
                    Sisakan jarak teks minimal <strong>3–5 mm</strong> dari tepi potong pada kartu nama, brosur, dan stiker.
                  </p>
                </div>

                <div className="clay-card-soft p-4 space-y-1">
                  <p className="font-extrabold text-slate-900">Kunci Tata Letak ke PDF</p>
                  <p className="text-slate-600 leading-relaxed">
                    Simpan dokumen teks ke format <strong>PDF</strong> agar posisi halaman dan jenis huruf tidak berubah saat dicetak.
                  </p>
                </div>
              </div>
            </div>

            {/* Jam Operasional & Pengambilan (2 Kolom) */}
            <div className="lg:col-span-2 clay-card p-6 sm:p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900">
                  Operasional & Pengambilan
                </h2>

                <div className="clay-card-soft p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-slate-900">Jam Produksi & Verifikasi</p>
                    <p className="text-slate-600">Senin – Sabtu: 08.00 – 20.00 WIB</p>
                    <p className="text-slate-600">
                      Pesanan di luar jam operasional tetap masuk antrean dan diproses pada hari kerja berikutnya.
                    </p>
                  </div>
                </div>

                <div className="clay-card-soft p-4 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-slate-900">Pengambilan Pesanan (Pickup)</p>
                    <p className="text-slate-600">
                      Tunjukkan <strong>Kode Order</strong> (contoh: <code>CP-2026...</code>) kepada petugas saat status pesanan berubah menjadi <strong>Siap Diambil</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="clay-btn-primary w-full py-3.5 px-4 text-xs sm:text-sm font-extrabold text-center"
              >
                Buat Akun Pelanggan Gratis
              </Link>
            </div>
          </section>

          {/* =========================================================
              5. Pertanyaan yang Sering Diajukan (FAQ)
             ========================================================= */}
          <section id="faq" className="clay-card p-6 sm:p-8 space-y-5 scroll-mt-24">
            <div className="flex items-center gap-3">
              <div className="clay-icon-box icon-sapphire w-11 h-11 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Pertanyaan yang Sering Diajukan
                </h2>
                <p className="text-xs text-slate-600">
                  Jawaban singkat seputar estimasi waktu cetak, pembayaran, dan pengambilan hasil.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {FAQS.map((item, idx) => (
                <details
                  key={item.q}
                  open={idx === 0}
                  className="group clay-card-soft overflow-hidden"
                >
                  <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-5 py-4 flex items-center justify-between gap-4">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      {item.q}
                    </span>
                    <ChevronDown className="w-4 h-4 text-indigo-600 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-4 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/80">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* =========================================================
              6. Spanduk Ajakan Utama
             ========================================================= */}
          <section className="clay-btn-primary p-7 sm:p-9 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Siap Mencetak Dokumen Anda Hari Ini?
              </h2>
              <p className="text-xs sm:text-sm text-white/95 max-w-xl leading-relaxed">
                Masuk ke Portal Pelanggan untuk mulai mengunggah file desain, menghitung estimasi biaya otomatis, dan memantau status cetak secara langsung.
              </p>
            </div>

            <Link
              href="/login"
              className="clay-pill px-6 py-3.5 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shrink-0"
            >
              <span>Mulai Buat Pesanan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </div>
      </main>

      {/* Footer Claymorphism */}
      <footer className="pb-6 px-4 sm:px-6 relative z-10">
        <div className="clay-card-soft max-w-6xl mx-auto py-4 px-6 text-center text-xs font-bold text-slate-600">
          &copy; {new Date().getFullYear()} Cloud Print — Sistem Layanan Percetakan Online.
        </div>
      </footer>

      {/* Widget Live Chat Internal Claymorphism */}
      <LiveChatWidget />
    </div>
  );
}