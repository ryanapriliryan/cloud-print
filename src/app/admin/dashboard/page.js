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
    return <div className="p-8 text-center text-sm text-slate-500">Memuat dasbor operasional...</div>;
  }

  const stats = data?.stats || {
    completedRevenue: 0,
    pendingVerificationCount: 0,
    inProgressCount: 0,
    totalOrders: 0,
    customerCount: 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Pendapatan Selesai</p>
          <p className="text-xl font-extrabold text-slate-900">
            {formatRupiah(stats.completedRevenue)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Perlu Verifikasi Bayar</p>
          <p className="text-xl font-extrabold text-slate-900">
            {stats.pendingVerificationCount} Pesanan
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Sedang Diproses / Siap</p>
          <p className="text-xl font-extrabold text-slate-900">
            {stats.inProgressCount} Pesanan
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Total Pelanggan Terdaftar</p>
          <p className="text-xl font-extrabold text-slate-900">
            {stats.customerCount} Akun
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Antrean Pesanan Terbaru</h2>
          <Link
            href="/admin/kelola-pesanan"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            Kelola Semua Pesanan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(data?.recentOrders || []).length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Belum ada pesanan masuk. Pastikan Master Data Harga sudah diatur sebelum pelanggan memesan.
            </p>
            <Link
              href="/admin/master-data"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
            >
              <Database className="w-3.5 h-3.5" />
              Atur Master Data Harga
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Kode Order</th>
                  <th className="px-6 py-3">Pelanggan</th>
                  <th className="px-6 py-3">Tagihan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentOrders.map((order) => {
                  const meta = ORDER_STATUS_META[order.status] || {
                    label: order.status,
                    badge: "bg-slate-100 text-slate-700",
                  };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        {order.orderCode}
                      </td>
                      <td className="px-6 py-3.5 text-slate-700">{order.user?.name}</td>
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
