"use client";

import { useEffect, useState, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Store,
  Tag,
  Layers,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
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
  const [paymentAccounts, setPaymentAccounts] = useState([
    { bankName: "", accountNumber: "", accountHolder: "" },
  ]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const printFormRef = useRef(null);
  const printNameInputRef = useRef(null);
  const finFormRef = useRef(null);
  const finNameInputRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [editingPrintId, setEditingPrintId] = useState(null);
  const [printForm, setPrintForm] = useState({
    category: PRINT_CATEGORIES[0],
    name: "",
    unit: "lembar",
    price: "",
    description: "",
  });

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
      const res = await fetch("/api/master-data", { cache: "no-store" });
      const data = await res.json();
      setPrintOptions(data.printOptions || []);
      setFinishings(data.finishings || []);
      if (data.storeSetting) {
        const s = data.storeSetting;
        setStoreForm({
          storeName: s.storeName || "Cloud Print",
          storeAddress: s.storeAddress || "",
          storePhone: s.storePhone || "",
          bankName: s.bankName || "",
          accountNumber: s.accountNumber || "",
          accountHolder: s.accountHolder || "",
          paymentNote: s.paymentNote || "",
        });

        let parsedAccounts = [];
        if (typeof s.bankName === "string" && s.bankName.trim().startsWith("[")) {
          try {
            const arr = JSON.parse(s.bankName);
            if (Array.isArray(arr)) parsedAccounts = arr;
          } catch {
            parsedAccounts = [];
          }
        } else if (s.bankName || s.accountNumber || s.accountHolder) {
          parsedAccounts = [
            {
              bankName: s.bankName || "",
              accountNumber: s.accountNumber || "",
              accountHolder: s.accountHolder || "",
            },
          ];
        }

        setPaymentAccounts(
          parsedAccounts.length > 0
            ? parsedAccounts
            : [{ bankName: "", accountNumber: "", accountHolder: "" }]
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMasterData();
  }, []);

  function handleStartEditPrintOption(item) {
    setEditingPrintId(item.id);
    setPrintForm({
      category: item.category,
      name: item.name,
      unit: item.unit,
      price: String(item.price),
      description: item.description || "",
    });

    requestAnimationFrame(() => {
      printFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        printNameInputRef.current?.focus({ preventScroll: true });
      }, 300);
    });
  }

  function handleStartEditFinishing(fin) {
    setEditingFinId(fin.id);
    setFinForm({
      category: fin.category,
      name: fin.name,
      unit: fin.unit,
      price: String(fin.price),
    });

    requestAnimationFrame(() => {
      finFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        finNameInputRef.current?.focus({ preventScroll: true });
      }, 300);
    });
  }

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

  async function handleConfirmDelete() {
    if (!deleteTarget || deleting) return;
    const { type, id } = deleteTarget;

    const endpoint =
      type === "print"
        ? `/api/admin/master-data/print-options/${id}`
        : `/api/admin/master-data/finishings/${id}`;

    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDeleteError(data.error || "Gagal menghapus item dari master data.");
        return;
      }

      if (type === "print" && editingPrintId === id) {
        setEditingPrintId(null);
        setPrintForm({
          category: PRINT_CATEGORIES[0],
          name: "",
          unit: "lembar",
          price: "",
          description: "",
        });
      }
      if (type === "finishing" && editingFinId === id) {
        setEditingFinId(null);
        setFinForm({
          category: "SEMUA",
          name: "",
          unit: "per dokumen",
          price: "",
        });
      }

      setDeleteTarget(null);
      await loadMasterData();
      showToast(
        type === "print"
          ? "Jenis cetak berhasil dihapus."
          : "Opsi finishing berhasil dihapus."
      );
    } catch {
      setDeleteError("Koneksi terputus saat menghapus data.");
    } finally {
      setDeleting(false);
    }
  }

  function handleAddAccountRow() {
    setPaymentAccounts((prev) => [
      ...prev,
      { bankName: "", accountNumber: "", accountHolder: "" },
    ]);
  }

  function handleAccountChange(index, field, value) {
    setPaymentAccounts((prev) =>
      prev.map((acc, idx) => (idx === index ? { ...acc, [field]: value } : acc))
    );
  }

  function handleRemoveAccountRow(index) {
    setPaymentAccounts((prev) => {
      if (prev.length <= 1) {
        return [{ bankName: "", accountNumber: "", accountHolder: "" }];
      }
      return prev.filter((_, idx) => idx !== index);
    });
  }

  async function handleSaveStoreSetting(e) {
    e.preventDefault();
    const cleanedAccounts = paymentAccounts
      .map((acc) => ({
        bankName: acc.bankName.trim(),
        accountNumber: acc.accountNumber.trim(),
        accountHolder: acc.accountHolder.trim(),
      }))
      .filter((acc) => acc.bankName || acc.accountNumber || acc.accountHolder);

    const payload = {
      ...storeForm,
      bankName:
        cleanedAccounts.length > 1
          ? JSON.stringify(cleanedAccounts)
          : cleanedAccounts[0]?.bankName || "",
      accountNumber: cleanedAccounts[0]?.accountNumber || "",
      accountHolder: cleanedAccounts[0]?.accountHolder || "",
    };

    const res = await fetch("/api/admin/store-setting", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await loadMasterData();
      showToast("Pengaturan toko dan daftar rekening pembayaran disimpan.");
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
          <div className="clay-icon-box w-11 h-11 flex items-center justify-center text-teal-600 shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">1. Master Jenis & Harga Cetak</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Tambahkan atau perbarui tarif cetak. Perubahan langsung tersinkronisasi ke halaman pemesanan pelanggan.
            </p>
          </div>
        </div>

        <form
          ref={printFormRef}
          onSubmit={handleSavePrintOption}
          className={`clay-card-soft scroll-mt-28 grid sm:grid-cols-5 gap-3.5 p-5 transition-all ${
            editingPrintId ? "ring-2 ring-teal-500/70 bg-teal-50/90" : ""
          }`}
        >
          {editingPrintId && (
            <div className="sm:col-span-5 flex items-center justify-between text-xs font-extrabold text-teal-700 pb-1">
              <span>Mode Edit Jenis Cetak: {printForm.name}</span>
            </div>
          )}

          <ClaySelect
            value={printForm.category}
            onChange={(val) => setPrintForm({ ...printForm, category: val })}
            options={PRINT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            className="text-xs font-semibold"
          />

          <input
            ref={printNameInputRef}
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
              className="clay-btn-primary flex-1 px-3.5 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
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
                className="clay-pill px-3 py-2.5 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-teal-100/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-teal-50/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider border-b border-teal-100">
              <tr>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Nama Layanan / Bahan</th>
                <th className="px-4 py-3.5">Satuan</th>
                <th className="px-4 py-3.5">Harga</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-100/60">
              {printOptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs font-medium text-slate-500">
                    Belum ada jenis cetak terdaftar. Silakan tambahkan menggunakan form di atas.
                  </td>
                </tr>
              ) : (
                printOptions.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      editingPrintId === item.id
                        ? "bg-teal-100/70"
                        : "hover:bg-teal-50/40"
                    }`}
                  >
                    <td className="px-4 py-3.5 text-xs font-extrabold text-teal-700">
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
                        onClick={() => handleStartEditPrintOption(item)}
                        className="clay-pill p-2 text-teal-600 inline-flex items-center justify-center cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError("");
                          setDeleteTarget({
                            type: "print",
                            id: item.id,
                            name: item.name,
                          });
                        }}
                        className="clay-btn-danger p-2 inline-flex items-center justify-center cursor-pointer"
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
          <div className="clay-icon-box w-11 h-11 flex items-center justify-center text-teal-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">2. Master Opsi Finishing</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Atur layanan tambahan seperti jilid lakban, spiral, laminating, mata ayam banner, atau potong stiker.
            </p>
          </div>
        </div>

        <form
          ref={finFormRef}
          onSubmit={handleSaveFinishing}
          className={`clay-card-soft scroll-mt-28 grid sm:grid-cols-5 gap-3.5 p-5 transition-all ${
            editingFinId ? "ring-2 ring-teal-500/70 bg-teal-50/90" : ""
          }`}
        >
          {editingFinId && (
            <div className="sm:col-span-5 flex items-center justify-between text-xs font-extrabold text-teal-700 pb-1">
              <span>Mode Edit Finishing: {finForm.name}</span>
            </div>
          )}

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
            ref={finNameInputRef}
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
              className="clay-btn-primary flex-1 px-3.5 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
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
                className="clay-pill px-3 py-2.5 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-teal-100/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-teal-50/70 text-slate-600 text-xs font-extrabold uppercase tracking-wider border-b border-teal-100">
              <tr>
                <th className="px-4 py-3.5">Kategori Berlaku</th>
                <th className="px-4 py-3.5">Nama Finishing</th>
                <th className="px-4 py-3.5">Satuan Hitung</th>
                <th className="px-4 py-3.5">Biaya</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-100/60">
              {finishings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs font-medium text-slate-500">
                    Belum ada opsi finishing terdaftar.
                  </td>
                </tr>
              ) : (
                finishings.map((fin) => (
                  <tr
                    key={fin.id}
                    className={`transition-colors ${
                      editingFinId === fin.id
                        ? "bg-teal-100/70"
                        : "hover:bg-teal-50/40"
                    }`}
                  >
                    <td className="px-4 py-3.5 text-xs font-extrabold text-teal-700">
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
                        onClick={() => handleStartEditFinishing(fin)}
                        className="clay-pill p-2 text-teal-600 inline-flex items-center justify-center cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError("");
                          setDeleteTarget({
                            type: "finishing",
                            id: fin.id,
                            name: fin.name,
                          });
                        }}
                        className="clay-btn-danger p-2 inline-flex items-center justify-center cursor-pointer"
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

      {/* Section 3: Pengaturan Toko & Multi-Rekening Pembayaran */}
      <div className="clay-card p-7 space-y-6">
        <div className="flex items-start gap-3.5">
          <div className="clay-icon-box w-11 h-11 flex items-center justify-center text-teal-600 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              3. Pengaturan Toko & Rekening Transfer Pembayaran
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Anda dapat menambahkan lebih dari satu rekening bank atau e-wallet untuk dipilih pelanggan saat pembayaran.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveStoreSetting} className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-5">
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
          </div>

          <div className="space-y-3.5 pt-2 border-t border-slate-200/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-800">
                Daftar Rekening Bank / E-Wallet Tujuan Transfer ({paymentAccounts.length})
              </span>
              <button
                type="button"
                onClick={handleAddAccountRow}
                className="clay-pill px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Rekening / E-Wallet
              </button>
            </div>

            <div className="space-y-3">
              {paymentAccounts.map((acc, idx) => (
                <div
                  key={idx}
                  className="clay-card-soft p-4 grid sm:grid-cols-12 gap-3.5 items-end"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Bank / E-Wallet #{idx + 1}
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: DANA / Bank BRI / BCA"
                      value={acc.bankName}
                      onChange={(e) => handleAccountChange(idx, "bankName", e.target.value)}
                      className="clay-input w-full px-3.5 py-2.5 text-sm font-medium text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nomor Rekening / No. HP
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nomor tujuan"
                      value={acc.accountNumber}
                      onChange={(e) => handleAccountChange(idx, "accountNumber", e.target.value)}
                      className="clay-input w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Atas Nama
                    </label>
                    <input
                      type="text"
                      placeholder="Nama pemilik"
                      value={acc.accountHolder}
                      onChange={(e) => handleAccountChange(idx, "accountHolder", e.target.value)}
                      className="clay-input w-full px-3.5 py-2.5 text-sm font-medium text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveAccountRow(idx)}
                      className="clay-btn-danger p-2.5 inline-flex items-center justify-center cursor-pointer"
                      title="Hapus metode pembayaran ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="clay-btn-primary px-6 py-3 text-xs font-bold cursor-pointer"
            >
              Simpan Pengaturan Toko & Rekening
            </button>
          </div>
        </form>
      </div>

      {/* Modal Konfirmasi Hapus Master Data */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="clay-card max-w-sm w-full p-7 text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-red-100 text-rose-600 flex items-center justify-center mx-auto shadow-[5px_5px_12px_rgba(244,63,94,0.2),inset_3px_3px_6px_rgba(255,255,255,0.95)]">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {deleteTarget.type === "print"
                  ? "Hapus Jenis Cetak?"
                  : "Hapus Opsi Finishing?"}
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                Item{" "}
                <strong className="text-slate-900">{deleteTarget.name}</strong>{" "}
                akan dihapus dari daftar master data.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="clay-pill flex-1 py-3 px-4 text-xs font-bold text-slate-700 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-bold text-xs shadow-[6px_8px_18px_rgba(225,29,72,0.35),inset_3px_3px_6px_rgba(255,255,255,0.4)] hover:brightness-105 disabled:opacity-60 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{deleting ? "Menghapus..." : "Ya, Hapus"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}