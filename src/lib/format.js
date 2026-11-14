export function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export function formatDate(dateInput) {
  if (!dateInput) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateInput));
}

export function formatShortDate(dateInput) {
  if (!dateInput) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateInput));
}

export const PRINT_CATEGORIES = [
  "Dokumen & Kertas",
  "Banner & Spanduk",
  "Stiker & Label",
  "Kartu Nama",
  "Buku & Majalah",
];

export const UNIT_OPTIONS = [
  { value: "lembar", label: "Per Lembar" },
  { value: "halaman", label: "Per Halaman" },
  { value: "meter", label: "Per Meter Persegi (m²)" },
  { value: "box", label: "Per Box" },
  { value: "paket", label: "Per Paket / Buku" },
];

export const ORDER_STATUS_META = {
  MENUNGGU_PEMBAYARAN: {
    label: "Menunggu Pembayaran",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  MENUNGGU_VERIFIKASI: {
    label: "Menunggu Verifikasi",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
  DIPROSES: {
    label: "Sedang Dicetak",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  SIAP_DIAMBIL: {
    label: "Siap Diambil",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  SELESAI: {
    label: "Selesai",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  DITOLAK: {
    label: "Pembayaran Ditolak",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
  },
};
