"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Trash2,
  Copy,
} from "lucide-react";
import { formatRupiah, formatDate, ORDER_STATUS_META } from "@/lib/format";

function RiwayatContent() {
  const searchParams = useSearchParams();
  const payOrderIdParam = searchParams.get("pay");

  const [orders, setOrders] = useState([]);
  const [storeSetting, setStoreSetting] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activePayOrder, setActivePayOrder] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [payError, setPayError] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, masterRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/master-data"),
      ]);
      const ordersData = await ordersRes.json();
      const masterData = await masterRes.json();
      const list = ordersData.orders || [];
      setOrders(list);
      setStoreSetting(masterData.storeSetting || null);

      if (payOrderIdParam) {
        const target = list.find((o) => o.id === payOrderIdParam);
        if (target && (target.status === "MENUNGGU_PEMBAYARAN" || target.status === "DITOLAK")) {
          setActivePayOrder(target);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [payOrderIdParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleProofFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPayError("");
    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "payments");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || "Gagal mengunggah foto bukti transfer.");
      } else {
        const uploadedUrl = data.url || data.fileUrl;
        if (!uploadedUrl) {
          setPayError("URL foto dari server kosong. Periksa pengaturan Supabase Storage.");
          return;
        }
        setProofUrl(uploadedUrl);
      }
    } catch {
      setPayError("Kesalahan koneksi saat mengunggah gambar.");
    } finally {
      setUploadingProof(false);
      e.target.value = "";
    }
  }

  async function handleConfirmPayment() {
    if (!proofUrl || !activePayOrder) {
      setPayError("Silakan unggah foto bukti transfer terlebih dahulu.");
      return;
    }
    setSavingPayment(true);
    setPayError("");
    try {
      const res = await fetch(`/api/orders/${activePayOrder.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProofUrl: proofUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || "Gagal menyimpan pembayaran.");
      } else {
        setActivePayOrder(null);
        setProofUrl("");
        await loadData();
      }
    } catch {
      setPayError("Terjadi kesalahan saat menyimpan bukti pembayaran.");
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleCancelOrder(orderId) {
    if (!confirm("Batalkan dan hapus pesanan yang belum dibayar ini?")) return;
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "PATCH" });
    if (res.ok) {
      await loadData();
    }
  }

  function handleCopyAccount() {
    if (!storeSetting?.accountNumber) return;
    navigator.clipboard.writeText(storeSetting.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Riwayat & Pembayaran Pesanan</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pantau status produksi cetak dan lakukan unggah bukti pembayaran langsung dari daftar pesanan Anda.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          Memuat riwayat pesanan...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          Belum ada pesanan tercatat.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const meta = ORDER_STATUS_META[order.status] || {
              label: order.status,
              badge: "bg-slate-100 text-slate-700",
            };
            const item = order.items?.[0];
            const canPay =
              order.status === "MENUNGGU_PEMBAYARAN" || order.status === "DITOLAK";

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900">{order.orderCode}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total Tagihan</p>
                    <p className="text-lg font-extrabold text-blue-600">
                      {formatRupiah(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {order.status === "DITOLAK" && order.rejectionReason && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Alasan Penolakan Admin:</span>
                      <span>{order.rejectionReason}</span>
                    </div>
                  </div>
                )}

                {item && (
                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{item.itemTitle}</p>
                      <p className="text-xs text-slate-500">
                        {item.unitLabel === "meter"
                          ? `Ukuran ${item.width}m x ${item.height}m • ${item.copies} pcs`
                          : `${item.quantity} ${item.unitLabel} • ${item.copies} rangkap`}
                        {item.finishingTitle ? ` • Finishing: ${item.finishingTitle}` : ""}
                      </p>
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline pt-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {item.fileName}
                      </a>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {order.status === "MENUNGGU_PEMBAYARAN" && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Batalkan
                        </button>
                      )}

                      {canPay && (
                        <button
                          type="button"
                          onClick={() => {
                            setActivePayOrder(order);
                            setProofUrl("");
                            setPayError("");
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition inline-flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          {order.status === "DITOLAK"
                            ? "Unggah Ulang Bukti Bayar"
                            : "Bayar & Unggah Bukti"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment & Transfer Proof Modal */}
      {activePayOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pembayaran Pesanan</h3>
                <p className="text-xs text-slate-500">{activePayOrder.orderCode}</p>
              </div>
              <button
                onClick={() => setActivePayOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-blue-800">Total Transfer</span>
                <span className="text-lg font-extrabold text-blue-700">
                  {formatRupiah(activePayOrder.totalAmount)}
                </span>
              </div>

              {storeSetting?.accountNumber ? (
                <div className="pt-2 border-t border-blue-200/70 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">{storeSetting.bankName}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {storeSetting.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? "Tersalin!" : "Salin"}
                    </button>
                  </div>
                  <p className="text-slate-600">a.n. {storeSetting.accountHolder}</p>
                </div>
              ) : (
                <p className="text-xs text-amber-800 pt-1">
                  Silakan lakukan pembayaran sesuai instruksi kasir/admin dan unggah bukti transaksi di bawah ini.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Unggah Foto / Screenshot Bukti Transfer
              </label>
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 transition">
                <UploadCloud className="w-7 h-7 text-blue-600 mb-1.5" />
                <span className="text-xs font-semibold text-slate-800">
                  {uploadingProof ? "Mengunggah foto..." : "Pilih Gambar Bukti Transfer"}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, atau WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofFileChange}
                  className="hidden"
                />
              </label>

              {proofUrl && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Bukti transfer berhasil diunggah dan siap dikirim.</span>
                </div>
              )}

              {payError && (
                <p className="mt-2 text-xs font-medium text-rose-600">{payError}</p>
              )}
            </div>

            <button
              type="button"
              disabled={savingPayment || uploadingProof}
              onClick={handleConfirmPayment}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm transition"
            >
              {savingPayment ? "Mengirim Bukti..." : "Kirim Bukti Pembayaran"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PelangganRiwayatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Memuat halaman...</div>}>
      <RiwayatContent />
    </Suspense>
  );
}