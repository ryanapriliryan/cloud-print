"use client";

import { useEffect, useState, useCallback } from "react";
import { Printer, Filter, Receipt, TrendingUp } from "lucide-react";
import { formatRupiah, formatShortDate } from "@/lib/format";

export default function AdminLaporanPage() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ totalTransactions: 0, totalRevenue: 0 });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    try {
      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setSummary(data.summary || { totalTransactions: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="space-y-7">
      <div className="clay-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Laporan Transaksi Selesai</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rekapitulasi pendapatan dari pesanan berstatus Selesai berdasarkan rentang tanggal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-indigo-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="clay-input px-3.5 py-2 font-semibold text-slate-700"
            />
            <span className="text-slate-400 font-bold">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="clay-input px-3.5 py-2 font-semibold text-slate-700"
            />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="clay-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="clay-card p-6 flex items-center gap-4">
          <div className="clay-icon-box w-14 h-14 flex items-center justify-center text-indigo-600 shrink-0">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Jumlah Transaksi Selesai
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {summary.totalTransactions} Transaksi
            </p>
          </div>
        </div>

        <div className="clay-card p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 flex items-center justify-center shadow-[5px_5px_12px_rgba(16,185,129,0.18),inset_3px_3px_6px_rgba(255,255,255,0.95)] shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Pendapatan Bersih
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {formatRupiah(summary.totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      <div className="clay-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm font-medium text-slate-500">
            Memuat laporan...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm font-medium text-slate-500">
            Belum ada transaksi berstatus Selesai pada periode yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-indigo-50/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider border-b border-indigo-100">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Kode Order</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Layanan Cetak</th>
                  <th className="px-6 py-4">Tanggal Selesai</th>
                  <th className="px-6 py-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100/60">
                {orders.map((order, idx) => (
                  <tr key={order.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      {order.orderCode}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{order.user?.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {order.items?.[0]?.itemTitle || "-"}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {formatShortDate(order.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-indigo-600">
                      {formatRupiah(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}