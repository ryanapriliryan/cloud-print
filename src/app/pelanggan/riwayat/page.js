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
          setPayError("URL foto dari server kosong.");
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
      <div className="clay-card p-6">
        <h1 className="text-lg font-extrabold text-slate-900">Riwayat & Pembayaran Pesanan</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pantau status produksi cetak dan lakukan unggah bukti pembayaran langsung dari daftar pesanan Anda.
        </p>
      </div>

      {loading ? (
        <div className="clay-card p-10 text-center text-sm font-medium text-slate-500">
          Memuat riwayat pesanan...
        </div>
      ) : orders.length === 0 ? (
        <div className="clay-card p-10 text-center text-sm font-medium text-slate-500">
          Belum ada pesanan tercatat.
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const meta = ORDER_STATUS_META[order.status] || {
              label: order.status,
              badge: "bg-slate-100 text-slate-700",
            };
            const item = order.items?.[0];
            const canPay =
              order.status === "MENUNGGU_PEMBAYARAN" || order.status === "DITOLAK";

            return (
              <div key={order.id} className="clay-card p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-indigo-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-slate-900">{order.orderCode}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500">Total Tagihan</p>
                    <p className="text-xl font-black text-indigo-600">
                      {formatRupiah(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {order.status === "DITOLAK" && order.rejectionReason && (
                  <div className="clay-btn-danger p-4 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block">Alasan Penolakan Admin:</span>
                      <span>{order.rejectionReason}</span>
                    </div>
                  </div>
                )}

                {item && (
                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                    <div className="space-y-1.5">
                      <p className="font-extrabold text-slate-900">{item.itemTitle}</p>
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
                        className="clay-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 mt-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {item.fileName}
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      {order.status === "MENUNGGU_PEMBAYARAN" && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id)}
                          className="clay-btn-danger px-4 py-2.5 text-xs font-bold inline-flex items-center gap-1.5"
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
                          className="clay-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5"
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

      {/* Clay Payment & Transfer Proof Modal */}
      {activePayOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clay-card max-w-md w-full p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Pembayaran Pesanan</h3>
                <p className="text-xs font-semibold text-indigo-500">{activePayOrder.orderCode}</p>
              </div>
              <button
                onClick={() => setActivePayOrder(null)}
                className="clay-pill p-2 text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="clay-card-soft p-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">Total Transfer</span>
                <span className="text-xl font-black text-indigo-600">
                  {formatRupiah(activePayOrder.totalAmount)}
                </span>
              </div>

              {storeSetting?.accountNumber ? (
                <div className="pt-2.5 border-t border-indigo-100 text-xs text-slate-700 space-y-1">
                  <p className="font-extrabold text-slate-900">{storeSetting.bankName}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-slate-900">
                      {storeSetting.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="clay-pill px-2.5 py-1 inline-flex items-center gap-1 text-indigo-600 font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? "Tersalin!" : "Salin"}
                    </button>
                  </div>
                  <p className="text-slate-600 font-medium">a.n. {storeSetting.accountHolder}</p>
                </div>
              ) : (
                <p className="text-xs text-amber-800 pt-1">
                  Silakan lakukan pembayaran sesuai instruksi kasir/admin dan unggah bukti transaksi di bawah ini.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Unggah Foto / Screenshot Bukti Transfer
              </label>
              <label className="clay-dropzone p-5 flex flex-col items-center justify-center text-center cursor-pointer">
                <div className="clay-icon-box w-11 h-11 flex items-center justify-center mb-2">
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-xs font-extrabold text-slate-800">
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
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100/80 p-3 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Bukti transfer berhasil diunggah dan siap dikirim.</span>
                </div>
              )}

              {payError && (
                <p className="mt-2 text-xs font-bold text-rose-600">{payError}</p>
              )}
            </div>

            <button
              type="button"
              disabled={savingPayment || uploadingProof}
              onClick={handleConfirmPayment}
              className="clay-btn-primary w-full py-3 px-4 font-bold text-sm"
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