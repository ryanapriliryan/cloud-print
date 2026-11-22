"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Eye,
  FileText,
  XCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { formatRupiah, formatDate, ORDER_STATUS_META } from "@/lib/format";
import ClaySelect from "@/components/ClaySelect";

export default function AdminKelolaPesananPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  // Reject Modal state
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Gagal menyinkronkan antrean pesanan:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(false);

    // Sinkronisasi otomatis di latar belakang setiap 4 detik tanpa berkedip
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadOrders(true);
      }
    }, 4000);

    // Segera perbarui saat tab difokuskan kembali atau saat notifikasi masuk
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        loadOrders(true);
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);
    window.addEventListener("cloudprint:sync-orders", handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("cloudprint:sync-orders", handleSync);
    };
  }, [loadOrders]);

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await loadOrders(true);
      }
    } finally {
      setUpdatingId("");
    }
  }

  async function handleConfirmReject(e) {
    e.preventDefault();
    if (!rejectOrder || !rejectionReason.trim()) return;
    setUpdatingId(rejectOrder.id);
    try {
      const res = await fetch(`/api/admin/orders/${rejectOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DITOLAK",
          rejectionReason: rejectionReason.trim(),
        }),
      });
      if (res.ok) {
        setRejectOrder(null);
        setRejectionReason("");
        await loadOrders(true);
      }
    } finally {
      setUpdatingId("");
    }
  }

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-7">
      <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Kelola Pesanan & Verifikasi</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verifikasi bukti transfer via Lightbox dan perbarui progres produksi cetak pelanggan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode / pelanggan..."
              className="clay-input pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800"
            />
          </div>

          <div className="w-52">
            <ClaySelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "ALL", label: "Semua Status" },
                ...Object.entries(ORDER_STATUS_META).map(([key, val]) => ({
                  value: key,
                  label: val.label,
                })),
              ]}
              className="text-sm font-semibold"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="clay-card p-10 text-center text-sm font-medium text-slate-500">
          Memuat daftar pesanan...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="clay-card p-10 text-center text-sm font-medium text-slate-500">
          Tidak ada pesanan yang sesuai dengan filter.
        </div>
      ) : (
        <div className="clay-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-indigo-50/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider border-b border-indigo-100">
                <tr>
                  <th className="px-5 py-4">Order & Pelanggan</th>
                  <th className="px-5 py-4">Detail Cetak & File</th>
                  <th className="px-5 py-4">Tagihan & Bukti</th>
                  <th className="px-5 py-4">Status Operasional</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100/60">
                {filteredOrders.map((order) => {
                  const item = order.items?.[0];
                  const meta = ORDER_STATUS_META[order.status] || {
                    label: order.status,
                    badge: "bg-slate-100 text-slate-700",
                  };
                  const isVerified =
                    order.status === "DIPROSES" ||
                    order.status === "SIAP_DIAMBIL" ||
                    order.status === "SELESAI";
                  const isLocked =
                    order.status === "SELESAI" || order.status === "DITOLAK";

                  return (
                    <tr key={order.id} className="hover:bg-indigo-50/40 transition-colors align-middle">
                      <td className="px-5 py-5">
                        <p className="font-extrabold text-slate-900">{order.orderCode}</p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          {order.user?.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-5 space-y-1.5">
                        <p className="font-bold text-slate-900">{item?.itemTitle}</p>
                        <p className="text-xs text-slate-500">
                          {item?.unitLabel === "meter"
                            ? `${item.width}m x ${item.height}m (${item.copies} pcs)`
                            : `${item?.quantity} ${item?.unitLabel} x ${item?.copies} rangkap`}
                          {item?.finishingTitle ? ` • ${item.finishingTitle}` : ""}
                        </p>
                        {order.notes && (
                          <p className="text-xs font-medium text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-xl inline-block">
                            Catatan: {order.notes}
                          </p>
                        )}
                        {item?.fileUrl && (
                          <div className="pt-1">
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="clay-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Unduh / Lihat File ({item.fileName})
                            </a>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-5 space-y-2.5">
                        <p className="font-extrabold text-indigo-600">
                          {formatRupiah(order.totalAmount)}
                        </p>
                        {order.paymentProofUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: order.paymentProofUrl,
                                code: order.orderCode,
                                customer: order.user?.name,
                              })
                            }
                            className="clay-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-600"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat Bukti (Lightbox)
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic block">
                            Belum ada bukti transfer
                          </span>
                        )}
                        {isVerified && (
                          <span className="block text-xs font-extrabold text-emerald-700">
                            ✓ Pembayaran Terverifikasi
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5 min-w-[200px]">
                        {order.status === "SELESAI" ? (
                          <span className="inline-block px-4 py-2 rounded-2xl text-xs font-extrabold bg-gradient-to-br from-emerald-100 to-teal-200 text-emerald-800 border border-emerald-300 shadow-[4px_4px_10px_rgba(16,185,129,0.18),inset_2px_2px_4px_rgba(255,255,255,0.9)]">
                            ✓ Selesai
                          </span>
                        ) : order.status === "DITOLAK" ? (
                          <span className="inline-block px-4 py-2 rounded-2xl text-xs font-extrabold bg-gradient-to-br from-rose-100 to-red-200 text-rose-800 border border-rose-300 shadow-[4px_4px_10px_rgba(244,63,94,0.18),inset_2px_2px_4px_rgba(255,255,255,0.9)]">
                            ✕ Pembayaran Ditolak
                          </span>
                        ) : (
                          <ClaySelect
                            disabled={updatingId === order.id}
                            value={order.status}
                            onChange={(val) => handleStatusChange(order.id, val)}
                            options={[
                              { value: "MENUNGGU_PEMBAYARAN", label: "Menunggu Pembayaran" },
                              { value: "MENUNGGU_VERIFIKASI", label: "Menunggu Verifikasi" },
                              { value: "DIPROSES", label: "Sedang Dicetak" },
                              { value: "SIAP_DIAMBIL", label: "Siap Diambil" },
                              { value: "SELESAI", label: "Selesai" },
                            ]}
                            className="text-xs font-semibold"
                          />
                        )}
                      </td>

                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        {order.status === "MENUNGGU_PEMBAYARAN" ||
                        order.status === "MENUNGGU_VERIFIKASI" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectOrder(order);
                              setRejectionReason("");
                            }}
                            className="clay-btn-danger inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak Pesanan
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Transfer Proof */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="clay-card max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Bukti Pembayaran — {lightboxImage.code}
                </h3>
                <p className="text-xs font-medium text-slate-500">Pelanggan: {lightboxImage.customer}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="clay-pill p-2 text-indigo-600"
                  title="Buka ukuran penuh"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="clay-pill p-2 text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-5 bg-indigo-50/50 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={lightboxImage.url}
                alt="Bukti Pembayaran"
                className="max-h-[65vh] w-auto rounded-2xl shadow-lg border-2 border-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal with Reason */}
      {rejectOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReject}
            className="clay-card max-w-md w-full p-7 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Tolak Pesanan ({rejectOrder.orderCode})
              </h3>
              <button
                type="button"
                onClick={() => setRejectOrder(null)}
                className="clay-pill p-2 text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tuliskan alasan penolakan (misal: nominal transfer kurang atau bukti buram). Pesan ini akan dikirim ke notifikasi pelanggan.
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="clay-input w-full px-4 py-3 text-sm"
            />
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setRejectOrder(null)}
                className="clay-pill px-4 py-2.5 text-xs font-bold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={updatingId === rejectOrder.id}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white text-xs font-bold shadow-[6px_8px_18px_rgba(225,29,72,0.35),inset_3px_3px_6px_rgba(255,255,255,0.4)] hover:brightness-105 transition"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}