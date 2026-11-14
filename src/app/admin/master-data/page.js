"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, Store } from "lucide-react";
import { formatRupiah, PRINT_CATEGORIES, UNIT_OPTIONS } from "@/lib/format";

export default function AdminMasterDataPage() {
  const [printOptions, setPrintOptions] = useState([]);
  const [finishings, setFinishings] = useState([]);
  const [storeForm, setStoreForm] = useState({
    storeName: "Cloud Print",
    storeAddress: "",
    storePhone: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    paymentNote: "",
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Print Option Form state
  const [editingPrintId, setEditingPrintId] = useState(null);
  const [printForm, setPrintForm] = useState({
    category: PRINT_CATEGORIES[0],
    name: "",
    unit: "lembar",
    price: "",
    description: "",
  });

  // Finishing Form state
  const [editingFinId, setEditingFinId] = useState(null);
  const [finForm, setFinForm] = useState({
    category: "SEMUA",
    name: "",
    unit: "per dokumen",
    price: "",
  });

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function loadMasterData() {
    try {
      const res = await fetch("/api/master-data");
      const data = await res.json();
      setPrintOptions(data.printOptions || []);
      setFinishings(data.finishings || []);
      if (data.storeSetting) {
        setStoreForm({
          storeName: data.storeSetting.storeName || "Cloud Print",
          storeAddress: data.storeSetting.storeAddress || "",
          storePhone: data.storeSetting.storePhone || "",
          bankName: data.storeSetting.bankName || "",
          accountNumber: data.storeSetting.accountNumber || "",
          accountHolder: data.storeSetting.accountHolder || "",
          paymentNote: data.storeSetting.paymentNote || "",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasterData();
  }, []);

  // Print Option Handlers
  async function handleSavePrintOption(e) {
    e.preventDefault();
    const url = editingPrintId
      ? `/api/admin/master-data/print-options/${editingPrintId}`
      : "/api/admin/master-data/print-options";
    const method = editingPrintId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(printForm),
    });

    if (res.ok) {
      setEditingPrintId(null);
      setPrintForm({
        category: PRINT_CATEGORIES[0],
        name: "",
        unit: "lembar",
        price: "",
        description: "",
      });
      await loadMasterData();
      showToast(editingPrintId ? "Jenis cetak diperbarui." : "Jenis cetak ditambahkan.");
    }
  }

  async function handleDeletePrintOption(id) {
    if (!confirm("Hapus jenis cetak ini dari master data?")) return;
    const res = await fetch(`/api/admin/master-data/print-options/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadMasterData();
      showToast("Jenis cetak berhasil dihapus.");
    }
  }

  // Finishing Handlers
  async function handleSaveFinishing(e) {
    e.preventDefault();
    const url = editingFinId
      ? `/api/admin/master-data/finishings/${editingFinId}`
      : "/api/admin/master-data/finishings";
    const method = editingFinId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finForm),
    });

    if (res.ok) {
      setEditingFinId(null);
      setFinForm({
        category: "SEMUA",
        name: "",
        unit: "per dokumen",
        price: "",
      });
      await loadMasterData();
      showToast(editingFinId ? "Opsi finishing diperbarui." : "Opsi finishing ditambahkan.");
    }
  }

  async function handleDeleteFinishing(id) {
    if (!confirm("Hapus opsi finishing ini?")) return;
    const res = await fetch(`/api/admin/master-data/finishings/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadMasterData();
      showToast("Opsi finishing berhasil dihapus.");
    }
  }

  // Store & Payment Setting Handler
  async function handleSaveStoreSetting(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/store-setting", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(storeForm),
    });
    if (res.ok) {
      showToast("Pengaturan toko dan rekening pembayaran disimpan.");
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Memuat master data...</div>;
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Section 1: Jenis & Harga Cetak CRUD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">1. Master Jenis & Harga Cetak</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambahkan atau perbarui tarif cetak. Perubahan langsung tersinkronisasi ke halaman pemesanan pelanggan.
          </p>
        </div>

        <form onSubmit={handleSavePrintOption} className="grid sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <select
            value={printForm.category}
            onChange={(e) => setPrintForm({ ...printForm, category: e.target.value })}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            {PRINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            required
            placeholder="Nama bahan (misal: HVS A4 80gr)"
            value={printForm.name}
            onChange={(e) => setPrintForm({ ...printForm, name: e.target.value })}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          />

          <select
            value={printForm.unit}
            onChange={(e) => setPrintForm({ ...printForm, unit: e.target.value })}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>

          <input
            type="number"
            required
            min="0"
            placeholder="Harga (Rp)"
            value={printForm.price}
            onChange={(e) => setPrintForm({ ...printForm, price: e.target.value })}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {editingPrintId ? "Update" : "Tambah"}
            </button>
            {editingPrintId && (
              <button
                type="button"
                onClick={() => {
                  setEditingPrintId(null);
                  setPrintForm({
                    category: PRINT_CATEGORIES[0],
                    name: "",
                    unit: "lembar",
                    price: "",
                    description: "",
                  });
                }}
                className="px-2.5 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Nama Layanan / Bahan</th>
                <th className="px-4 py-3">Satuan</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {printOptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-500">
                    Belum ada jenis cetak terdaftar. Silakan tambahkan menggunakan form di atas.
                  </td>
                </tr>
              ) : (
                printOptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-semibold text-blue-700">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.unit}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPrintId(item.id);
                          setPrintForm({
                            category: item.category,
                            name: item.name,
                            unit: item.unit,
                            price: String(item.price),
                            description: item.description || "",
                          });
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePrintOption(item.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Master Finishing CRUD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">2. Master Opsi Finishing</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur layanan tambahan seperti jilid lakban, spiral, laminating, mata ayam banner, atau potong stiker.
          </p>
        </div>

        <form onSubmit={handleSaveFinishing} className="grid sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <select
            value={finForm.category}
            onChange={(e) => setFinForm({ ...finForm, category: e.target.value })}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="SEMUA">Semua Kategori</option>
            {PRINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            required
            placeholder="Nama finishing (misal: Jilid Spiral)"
            value={finForm.name}
            onChange={(e) => setFinForm({ ...finForm, name: e.target.value })}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          />

          <select
            value={finForm.unit}
            onChange={(e) => setFinForm({ ...finForm, unit: e.target.value })}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="per dokumen">Per Dokumen / Paket</option>
            <option value="per lembar">Per Lembar</option>
            <option value="per meter">Per Meter Persegi</option>
          </select>

          <input
            type="number"
            required
            min="0"
            placeholder="Harga (Rp)"
            value={finForm.price}
            onChange={(e) => setFinForm({ ...finForm, price: e.target.value })}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {editingFinId ? "Update" : "Tambah"}
            </button>
            {editingFinId && (
              <button
                type="button"
                onClick={() => {
                  setEditingFinId(null);
                  setFinForm({
                    category: "SEMUA",
                    name: "",
                    unit: "per dokumen",
                    price: "",
                  });
                }}
                className="px-2.5 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Kategori Berlaku</th>
                <th className="px-4 py-3">Nama Finishing</th>
                <th className="px-4 py-3">Satuan Hitung</th>
                <th className="px-4 py-3">Biaya</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finishings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-500">
                    Belum ada opsi finishing terdaftar.
                  </td>
                </tr>
              ) : (
                finishings.map((fin) => (
                  <tr key={fin.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                      {fin.category}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{fin.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{fin.unit}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatRupiah(fin.price)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFinId(fin.id);
                          setFinForm({
                            category: fin.category,
                            name: fin.name,
                            unit: fin.unit,
                            price: String(fin.price),
                          });
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFinishing(fin.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Pengaturan Toko & Rekening Pembayaran */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              3. Pengaturan Toko & Rekening Transfer Pembayaran
            </h2>
            <p className="text-xs text-slate-500">
              Informasi rekening ini akan ditampilkan kepada pelanggan saat mengunggah bukti pembayaran.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveStoreSetting} className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Percetakan</label>
            <input
              type="text"
              value={storeForm.storeName}
              onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon / WA</label>
            <input
              type="text"
              value={storeForm.storePhone}
              onChange={(e) => setStoreForm({ ...storeForm, storePhone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Percetakan</label>
            <input
              type="text"
              value={storeForm.storeAddress}
              onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bank / E-Wallet</label>
            <input
              type="text"
              placeholder="Contoh: Bank BRI / BCA / Mandiri"
              value={storeForm.bankName}
              onChange={(e) => setStoreForm({ ...storeForm, bankName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Rekening</label>
            <input
              type="text"
              placeholder="Masukkan nomor rekening"
              value={storeForm.accountNumber}
              onChange={(e) => setStoreForm({ ...storeForm, accountNumber: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Atas Nama Pemilik Rekening</label>
            <input
              type="text"
              placeholder="Nama pemilik rekening"
              value={storeForm.accountHolder}
              onChange={(e) => setStoreForm({ ...storeForm, accountHolder: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              Simpan Pengaturan Toko & Rekening
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
