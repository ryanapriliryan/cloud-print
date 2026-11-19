"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, Store, Tag, Layers } from "lucide-react";
import { formatRupiah, PRINT_CATEGORIES, UNIT_OPTIONS } from "@/lib/format";
import ClaySelect from "@/components/ClaySelect";

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
      method,
    });
    if (res.ok) {
      await loadMasterData();
      showToast("Jenis cetak berhasil dihapus.");
    }
  }

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
      method,
    });
    if (res.ok) {
      await loadMasterData();
      showToast("Opsi finishing berhasil dihapus.");
    }
  }

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
    return (
      <div className="clay-card p-10 text-center text-sm font-medium text-slate-600">
        Memuat master data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 py-3.5 shadow-[8px_10px_20px_rgba(16,185,129,0.35),inset_3px_3px_6px_rgba(255,255,255,0.4)] text-sm font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Section 1: Jenis & Harga Cetak CRUD */}
      <div className="clay-card p-7 space-y-6">
        <div className="flex items-start gap-3.5">
          <div className="clay-icon-box w-11 h-11 flex items-center justify-center text-indigo-600 shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">1. Master Jenis & Harga Cetak</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tambahkan atau perbarui tarif cetak. Perubahan langsung tersinkronisasi ke halaman pemesanan pelanggan.
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePrintOption} className="clay-card-soft grid sm:grid-cols-5 gap-3.5 p-5">
          <ClaySelect
            value={printForm.category}
            onChange={(val) => setPrintForm({ ...printForm, category: val })}
            options={PRINT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            className="text-xs font-semibold"
          />

          <input
            type="text"
            required
            placeholder="Nama bahan (misal: HVS A4 80gr)"
            value={printForm.name}
            onChange={(e) => setPrintForm({ ...printForm, name: e.target.value })}
            className="clay-input px-3.5 py-2.5 text-xs font-medium text-slate-800"
          />

          <ClaySelect
            value={printForm.unit}
            onChange={(val) => setPrintForm({ ...printForm, unit: val })}
            options={UNIT_OPTIONS}
            className="text-xs font-semibold"
          />

          <input
            type="number"
            required
            min="0"
            placeholder="Harga (Rp)"
            value={printForm.price}
            onChange={(e) => setPrintForm({ ...printForm, price: e.target.value })}
            className="clay-input px-3.5 py-2.5 text-xs font-semibold text-slate-800"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="clay-btn-primary flex-1 px-3.5 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5"
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
                className="clay-pill px-3 py-2.5 text-xs font-bold text-slate-600"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-indigo-100/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-indigo-50/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider border-b border-indigo-100">
              <tr>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Nama Layanan / Bahan</th>
                <th className="px-4 py-3.5">Satuan</th>
                <th className="px-4 py-3.5">Harga</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100/60">
              {printOptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs font-medium text-slate-500">
                    Belum ada jenis cetak terdaftar. Silakan tambahkan menggunakan form di atas.
                  </td>
                </tr>
              ) : (
                printOptions.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-extrabold text-indigo-600">
                      {item.category}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600">{item.unit}</td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-900">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
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
                        className="clay-pill p-2 text-indigo-600 inline-flex items-center justify-center"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePrintOption(item.id)}
                        className="clay-btn-danger p-2 inline-flex items-center justify-center"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      <div className="clay-card p-7 space-y-6">
        <div className="flex items-start gap-3.5">
          <div className="clay-icon-box w-11 h-11 flex items-center justify-center text-indigo-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">2. Master Opsi Finishing</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur layanan tambahan seperti jilid lakban, spiral, laminating, mata ayam banner, atau potong stiker.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveFinishing} className="clay-card-soft grid sm:grid-cols-5 gap-3.5 p-5">
          <ClaySelect
            value={finForm.category}
            onChange={(val) => setFinForm({ ...finForm, category: val })}
            options={[
              { value: "SEMUA", label: "Semua Kategori" },
              ...PRINT_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
            className="text-xs font-semibold"
          />

          <input
            type="text"
            required
            placeholder="Nama finishing (misal: Jilid Spiral)"
            value={finForm.name}
            onChange={(e) => setFinForm({ ...finForm, name: e.target.value })}
            className="clay-input px-3.5 py-2.5 text-xs font-medium text-slate-800"
          />

          <ClaySelect
            value={finForm.unit}
            onChange={(val) => setFinForm({ ...finForm, unit: val })}
            options={[
              { value: "per dokumen", label: "Per Dokumen / Paket" },
              { value: "per lembar", label: "Per Lembar" },
              { value: "per meter", label: "Per Meter Persegi" },
            ]}
            className="text-xs font-semibold"
          />

          <input
            type="number"
            required
            min="0"
            placeholder="Harga (Rp)"
            value={finForm.price}
            onChange={(e) => setFinForm({ ...finForm, price: e.target.value })}
            className="clay-input px-3.5 py-2.5 text-xs font-semibold text-slate-800"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="clay-btn-primary flex-1 px-3.5 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5"
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
                className="clay-pill px-3 py-2.5 text-xs font-bold text-slate-600"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-indigo-100/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-indigo-50/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider border-b border-indigo-100">
              <tr>
                <th className="px-4 py-3.5">Kategori Berlaku</th>
                <th className="px-4 py-3.5">Nama Finishing</th>
                <th className="px-4 py-3.5">Satuan Hitung</th>
                <th className="px-4 py-3.5">Biaya</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100/60">
              {finishings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs font-medium text-slate-500">
                    Belum ada opsi finishing terdaftar.
                  </td>
                </tr>
              ) : (
                finishings.map((fin) => (
                  <tr key={fin.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-extrabold text-indigo-600">
                      {fin.category}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{fin.name}</td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600">{fin.unit}</td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-900">
                      {formatRupiah(fin.price)}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
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
                        className="clay-pill p-2 text-indigo-600 inline-flex items-center justify-center"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFinishing(fin.id)}
                        className="clay-btn-danger p-2 inline-flex items-center justify-center"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      <div className="clay-card p-7 space-y-6">
        <div className="flex items-start gap-3.5">
          <div className="clay-icon-box w-11 h-11 flex items-center justify-center text-indigo-600 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              3. Pengaturan Toko & Rekening Transfer Pembayaran
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Informasi rekening ini akan ditampilkan kepada pelanggan saat mengunggah bukti pembayaran.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveStoreSetting} className="grid sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Percetakan</label>
            <input
              type="text"
              value={storeForm.storeName}
              onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
              className="clay-input w-full px-4 py-2.5 text-sm font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Telepon / WA</label>
            <input
              type="text"
              value={storeForm.storePhone}
              onChange={(e) => setStoreForm({ ...storeForm, storePhone: e.target.value })}
              className="clay-input w-full px-4 py-2.5 text-sm font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Percetakan</label>
            <input
              type="text"
              value={storeForm.storeAddress}
              onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })}
              className="clay-input w-full px-4 py-2.5 text-sm font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Bank / E-Wallet</label>
            <input
              type="text"
              placeholder="Contoh: Bank BRI / BCA / DANA"
              value={storeForm.bankName}
              onChange={(e) => setStoreForm({ ...storeForm, bankName: e.target.value })}
              className="clay-input w-full px-4 py-2.5 text-sm font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Rekening</label>
            <input
              type="text"
              placeholder="Masukkan nomor rekening"
              value={storeForm.accountNumber}
              onChange={(e) => setStoreForm({ ...storeForm, accountNumber: e.target.value })}
              className="clay-input w-full px-4 py-2.5 text-sm font-mono font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Atas Nama Pemilik Rekening</label>
            <input
              type="text"
              placeholder="Nama pemilik rekening"
              value={storeForm.accountHolder}
              onChange={(e) => setStoreForm({ ...storeForm, accountHolder: e.target.value })}
              className="clay-input w-full px-4 py-2.5 text-sm font-medium text-slate-800"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              className="clay-btn-primary px-6 py-3 text-xs font-bold"
            >
              Simpan Pengaturan Toko & Rekening
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}