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
    <div className="space-y-7">
      {/* Banner Sambutan 3D Clay */}
      <div className="rounded-[28px] bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 p-7 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-2 border-white/30 shadow-[12px_16px_30px_rgba(37,99,235,0.32),inset_4px_4px_12px_rgba(255,255,255,0.38),inset_-4px_-4px_12px_rgba(30,58,138,0.35)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Selamat Datang di Cloud Print
          </h1>
          <p className="text-blue-100 text-sm mt-1.5 max-w-xl">
            Unggah dokumen cetak Anda secara online dengan kalkulasi harga otomatis dan transparan.
          </p>
        </div>
        <Link
          href="/pelanggan/buat-pesanan"
          className="clay-pill inline-flex items-center justify-center gap-2 px-5 py-3.5 text-indigo-700 font-extrabold text-sm shrink-0"
        >
          <FilePlus2 className="w-4 h-4" />
          Buat Pesanan Baru
        </Link>
      </div>

      {/* 3 Kartu Statistik Claymorphism */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="clay-card p-6 flex items-center gap-4 hover:-translate-y-1">
          <div className="clay-icon-box w-13 h-13 text-indigo-600 flex items-center justify-center shrink-0">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pesanan Anda
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalOrders}</p>
          </div>
        </div>

        <div className="clay-card p-6 flex items-center gap-4 hover:-translate-y-1">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 flex items-center justify-center shadow-[5px_5px_12px_rgba(245,158,11,0.18),inset_3px_3px_6px_rgba(255,255,255,0.95)] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sedang Berjalan
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{activeOrders}</p>
          </div>
        </div>

        <div className="clay-card p-6 flex items-center gap-4 hover:-translate-y-1">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 flex items-center justify-center shadow-[5px_5px_12px_rgba(16,185,129,0.18),inset_3px_3px_6px_rgba(255,255,255,0.95)] shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pesanan Selesai
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{completedOrders}</p>
          </div>
        </div>
      </div>

      {/* Tabel Aktivitas Pesanan Terbaru */}
      <div className="clay-card overflow-hidden">
        <div className="px-6 py-5 border-b border-indigo-100/80 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-extrabold text-slate-900 text-base">
            Aktivitas Pesanan Terbaru
          </h2>
          <Link
            href="/pelanggan/riwayat"
            className="clay-pill px-4 py-2 text-xs font-bold text-indigo-600 inline-flex items-center gap-1.5"
          >
            Lihat Semua Riwayat <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm font-medium text-slate-500">
            Memuat data pesanan...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center space-y-4">
            <p className="text-sm font-medium text-slate-600">
              Anda belum memiliki riwayat pesanan cetak.
            </p>
            <Link
              href="/pelanggan/buat-pesanan"
              className="clay-btn-primary inline-flex items-center gap-2 px-5 py-3 text-xs font-bold"
            >
              Mulai Pesan Pertama Anda
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-indigo-50/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider border-b border-indigo-100">
                <tr>
                  <th className="px-6 py-4">Kode Order</th>
                  <th className="px-6 py-4">Layanan Cetak</th>
                  <th className="px-6 py-4">Total Tagihan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100/60">
                {orders.slice(0, 5).map((order) => {
                  const meta = ORDER_STATUS_META[order.status] || {
                    label: order.status,
                    badge: "bg-slate-100 text-slate-700",
                  };
                  const firstItem = order.items?.[0];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-indigo-50/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {order.orderCode}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {firstItem?.itemTitle || "-"}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-indigo-600">
                        {formatRupiah(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
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