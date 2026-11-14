"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  FileText,
  XCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { formatRupiah, formatDate, ORDER_STATUS_META } from "@/lib/format";

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

  async function loadOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await loadOrders();
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
        await loadOrders();
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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Kelola Pesanan & Verifikasi</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verifikasi bukti transfer via Lightbox dan perbarui progres produksi cetak pelanggan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode / pelanggan..."
              className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            {Object.entries(ORDER_STATUS_META).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          Memuat daftar pesanan...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          Tidak ada pesanan yang sesuai dengan filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Order & Pelanggan</th>
                  <th className="px-5 py-3.5">Detail Cetak & File</th>
                  <th className="px-5 py-3.5">Tagihan & Bukti</th>
                  <th className="px-5 py-3.5">Status Operasional</th>
                  <th className="px-5 py-3.5 text-right">Aksi Penolakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const item = order.items?.[0];
                  const meta = ORDER_STATUS_META[order.status] || {
                    label: order.status,
                    badge: "bg-slate-100 text-slate-700",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 align-top">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{order.orderCode}</p>
                        <p className="text-xs font-medium text-slate-700 mt-0.5">
                          {order.user?.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4 space-y-1">
                        <p className="font-semibold text-slate-900">{item?.itemTitle}</p>
                        <p className="text-xs text-slate-500">
                          {item?.unitLabel === "meter"
                            ? `${item.width}m x ${item.height}m (${item.copies} pcs)`
                            : `${item?.quantity} ${item?.unitLabel} x ${item?.copies} rangkap`}
                          {item?.finishingTitle ? ` • ${item.finishingTitle}` : ""}
                        </p>
                        {order.notes && (
                          <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                            Catatan: {order.notes}
                          </p>
                        )}
                        {item?.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline pt-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Unduh / Lihat File ({item.fileName})
                          </a>
                        )}
                      </td>

                      <td className="px-5 py-4 space-y-2">
                        <p className="font-bold text-slate-900">
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat Bukti (Lightbox)
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic block">
                            Belum ada bukti transfer
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 space-y-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                        {/* Clean operational dropdown without duplicate DITOLAK option */}
                        <select
                          disabled={updatingId === order.id}
                          value={
                            order.status === "DITOLAK"
                              ? "MENUNGGU_VERIFIKASI"
                              : order.status
                          }
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="block w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
                          <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                          <option value="DIPROSES">Sedang Dicetak</option>
                          <option value="SIAP_DIAMBIL">Siap Diambil</option>
                          <option value="SELESAI">Selesai</option>
                        </select>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {order.status !== "SELESAI" && order.status !== "DITOLAK" && (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectOrder(order);
                              setRejectionReason("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak Pesanan
                          </button>
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
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bukti Pembayaran — {lightboxImage.code}
                </h3>
                <p className="text-xs text-slate-500">Pelanggan: {lightboxImage.customer}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 hover:text-blue-600"
                  title="Buka ukuran penuh"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={lightboxImage.url}
                alt="Bukti Pembayaran"
                className="max-h-[65vh] w-auto rounded-lg shadow"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal with Reason */}
      {rejectOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReject}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Tolak Pesanan ({rejectOrder.orderCode})
              </h3>
              <button
                type="button"
                onClick={() => setRejectOrder(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Tuliskan alasan penolakan (misal: nominal transfer kurang atau bukti buram). Pesan ini akan dikirim ke notifikasi pelanggan.
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={updatingId === rejectOrder.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm"
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
