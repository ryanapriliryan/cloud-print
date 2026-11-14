"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus2, Clock, CheckCircle2, Printer, ArrowRight } from "lucide-react";
import { formatRupiah, formatDate, ORDER_STATUS_META } from "@/lib/format";

export default function PelangganDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) =>
    ["MENUNGGU_PEMBAYARAN", "MENUNGGU_VERIFIKASI", "DIPROSES", "SIAP_DIAMBIL"].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o) => o.status === "SELESAI").length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Selamat Datang di Cloud Print</h1>
          <p className="text-blue-100 text-sm mt-1">
            Unggah dokumen cetak Anda secara online dengan kalkulasi harga otomatis dan transparan.
          </p>
        </div>
        <Link
          href="/pelanggan/buat-pesanan"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm rounded-xl shadow-sm transition shrink-0"
        >
          <FilePlus2 className="w-4 h-4" />
          Buat Pesanan Baru
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Pesanan Anda</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Sedang Berjalan</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{activeOrders}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pesanan Selesai</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{completedOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Aktivitas Pesanan Terbaru</h2>
          <Link
            href="/pelanggan/riwayat"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            Lihat Semua Riwayat <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Memuat data pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-slate-600">Anda belum memiliki riwayat pesanan cetak.</p>
            <Link
              href="/pelanggan/buat-pesanan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
            >
              Mulai Pesan Pertama Anda
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Kode Order</th>
                  <th className="px-6 py-3">Layanan Cetak</th>
                  <th className="px-6 py-3">Total Tagihan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => {
                  const meta = ORDER_STATUS_META[order.status] || {
                    label: order.status,
                    badge: "bg-slate-100 text-slate-700",
                  };
                  const firstItem = order.items?.[0];
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        {order.orderCode}
                      </td>
                      <td className="px-6 py-3.5 text-slate-700">
                        {firstItem?.itemTitle || "-"}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        {formatRupiah(order.totalAmount)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
