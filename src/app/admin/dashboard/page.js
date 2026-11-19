"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Clock,
  Printer,
  Users,
  ArrowRight,
  Database,
} from "lucide-react";
import { formatRupiah, formatDate, ORDER_STATUS_META } from "@/lib/format";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="clay-card p-10 text-center text-sm font-medium text-slate-600">
        Memuat dasbor operasional...
      </div>
    );
  }

  const stats = data?.stats || {
    completedRevenue: 0,
    pendingVerificationCount: 0,
    inProgressCount: 0,
    totalOrders: 0,
    customerCount: 0,
  };

  return (
    <div className="space-y-7">
      {/* Grid 4 Kartu Statistik Claymorphism */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="clay-card p-6 space-y-3 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 flex items-center justify-center shadow-[5px_5px_12px_rgba(16,185,129,0.18),inset_3px_3px_6px_rgba(255,255,255,0.95)]">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pendapatan Selesai
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {formatRupiah(stats.completedRevenue)}
            </p>
          </div>
        </div>

        <div className="clay-card p-6 space-y-3 hover:-translate-y-1">
          <div className="clay-icon-box w-12 h-12 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Perlu Verifikasi Bayar
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats.pendingVerificationCount} Pesanan
            </p>
          </div>
        </div>

        <div className="clay-card p-6 space-y-3 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center shadow-[5px_5px_12px_rgba(99,102,241,0.18),inset_3px_3px_6px_rgba(255,255,255,0.95)]">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sedang Diproses / Siap
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats.inProgressCount} Pesanan
            </p>
          </div>
        </div>

        <div className="clay-card p-6 space-y-3 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-slate-100 text-slate-700 flex items-center justify-center shadow-[5px_5px_12px_rgba(100,116,139,0.18),inset_3px_3px_6px_rgba(255,255,255,0.95)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pelanggan Terdaftar
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats.customerCount} Akun
            </p>
          </div>
        </div>
      </div>

      {/* Tabel Antrean Pesanan Terbaru */}
      <div className="clay-card overflow-hidden">
        <div className="px-6 py-5 border-b border-indigo-100/80 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-extrabold text-slate-900 text-base">
            Antrean Pesanan Terbaru
          </h2>
          <Link
            href="/admin/kelola-pesanan"
            className="clay-pill px-4 py-2 text-xs font-bold text-indigo-600 inline-flex items-center gap-1.5"
          >
            Kelola Semua Pesanan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(data?.recentOrders || []).length === 0 ? (
          <div className="p-10 text-center space-y-4">
            <p className="text-sm font-medium text-slate-600">
              Belum ada pesanan masuk. Pastikan Master Data Harga sudah diatur sebelum pelanggan memesan.
            </p>
            <Link
              href="/admin/master-data"
              className="clay-btn-primary inline-flex items-center gap-2 px-5 py-3 text-xs font-bold"
            >
              <Database className="w-4 h-4" />
              Atur Master Data Harga
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-indigo-50/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider border-b border-indigo-100">
                <tr>
                  <th className="px-6 py-4">Kode Order</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Tagihan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100/60">
                {data.recentOrders.map((order) => {
                  const meta = ORDER_STATUS_META[order.status] || {
                    label: order.status,
                    badge: "bg-slate-100 text-slate-700",
                  };
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-indigo-50/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        {order.orderCode}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {order.user?.name}
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