"use client";

import { useEffect, useState, useCallback } from "react";
import { Printer, Filter } from "lucide-react";
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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Laporan Transaksi Selesai</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rekapitulasi pendapatan dari pesanan berstatus Selesai berdasarkan rentang tanggal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Jumlah Transaksi Selesai</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {summary.totalTransactions} Transaksi
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Pendapatan Bersih</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatRupiah(summary.totalRevenue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Memuat laporan...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Belum ada transaksi berstatus Selesai pada periode yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">No</th>
                  <th className="px-6 py-3">Kode Order</th>
                  <th className="px-6 py-3">Pelanggan</th>
                  <th className="px-6 py-3">Layanan Cetak</th>
                  <th className="px-6 py-3">Tanggal Selesai</th>
                  <th className="px-6 py-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order, idx) => (
                  <tr key={order.id}>
                    <td className="px-6 py-3.5 text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      {order.orderCode}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{order.user?.name}</td>
                    <td className="px-6 py-3.5 text-slate-700">
                      {order.items?.[0]?.itemTitle || "-"}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {formatShortDate(order.updatedAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-900">
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
