"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { formatRupiah, PRINT_CATEGORIES } from "@/lib/format";

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function BuatPesananPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [printOptions, setPrintOptions] = useState([]);
  const [finishings, setFinishings] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // Step 1 form state
  const [selectedCategory, setSelectedCategory] = useState(PRINT_CATEGORIES[0]);
  const [selectedPrintId, setSelectedPrintId] = useState("");
  const [selectedFinishingId, setSelectedFinishingId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [copies, setCopies] = useState(1);
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [notes, setNotes] = useState("");

  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Step 2 checkout state
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch("/api/master-data")
      .then((res) => res.json())
      .then((data) => {
        const opts = data.printOptions || [];
        const fins = data.finishings || [];
        setPrintOptions(opts);
        setFinishings(fins);
        if (opts.length > 0) {
          const initialCat = opts[0].category;
          setSelectedCategory(initialCat);
          setSelectedPrintId(opts[0].id);
        }
        setLoadingMaster(false);
      })
      .catch(() => setLoadingMaster(false));
  }, []);

  const filteredPrintOptions = useMemo(
    () => printOptions.filter((o) => o.category === selectedCategory),
    [printOptions, selectedCategory]
  );

  const filteredFinishings = useMemo(
    () =>
      finishings.filter(
        (f) => f.category === "SEMUA" || f.category === selectedCategory
      ),
    [finishings, selectedCategory]
  );

  const activePrintOption = useMemo(
    () => printOptions.find((o) => o.id === selectedPrintId) || null,
    [printOptions, selectedPrintId]
  );

  const activeFinishing = useMemo(
    () => finishings.find((f) => f.id === selectedFinishingId) || null,
    [finishings, selectedFinishingId]
  );

  function handleCategoryChange(cat) {
    setSelectedCategory(cat);
    const matching = printOptions.filter((o) => o.category === cat);
    setSelectedPrintId(matching[0]?.id || "");
    setSelectedFinishingId("");
  }

  const pricing = useMemo(() => {
    if (!activePrintOption) {
      return { baseCost: 0, finishingCost: 0, total: 0 };
    }
    const safeCopies = Math.max(1, Number(copies) || 1);
    const safeQty = Math.max(1, Number(quantity) || 1);
    const safeW = Math.max(0.1, Number(width) || 1);
    const safeH = Math.max(0.1, Number(height) || 1);

    let baseCost = 0;
    if (activePrintOption.unit === "meter") {
      baseCost = Math.round(safeW * safeH * activePrintOption.price * safeCopies);
    } else {
      baseCost = Math.round(safeQty * activePrintOption.price * safeCopies);
    }

    let finishingCost = 0;
    if (activeFinishing) {
      if (activeFinishing.unit === "per lembar" || activeFinishing.unit === "per halaman") {
        finishingCost = activeFinishing.price * safeQty * safeCopies;
      } else if (activeFinishing.unit === "per meter") {
        finishingCost = Math.round(activeFinishing.price * safeW * safeH * safeCopies);
      } else {
        finishingCost = activeFinishing.price * safeCopies;
      }
    }

    return {
      baseCost,
      finishingCost,
      total: baseCost + finishingCost,
    };
  }, [activePrintOption, activeFinishing, quantity, copies, width, height]);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "documents");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Gagal mengunggah dokumen.");
      } else {
        const resolvedUrl = data.url || data.fileUrl;
        if (!resolvedUrl) {
          setUploadError("URL file dari server kosong. Periksa konfigurasi Supabase Storage.");
          return;
        }
        const rawSize = data.fileSize || data.size || file.size;
        setUploadedFile({
          fileName: data.fileName || data.name || file.name,
          url: resolvedUrl,
          fileSize: typeof rawSize === "number" ? formatBytes(rawSize) : rawSize,
        });
      }
    } catch {
      setUploadError("Terjadi kesalahan saat mengunggah file.");
    } finally {
      setUploading(false);
    }
  }

  function handleNextToStep2() {
    if (!activePrintOption) {
      setUploadError("Silakan pilih jenis layanan cetak terlebih dahulu.");
      return;
    }
    if (!uploadedFile || !uploadedFile.url) {
      setUploadError("Silakan unggah dokumen atau file desain cetak terlebih dahulu.");
      return;
    }
    setUploadError("");
    setStep(2);
  }

  async function handleCreateOrder() {
    if (!agreed) {
      setSubmitError("Silakan centang persetujuan spesifikasi dan biaya pesanan.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printOptionId: activePrintOption.id,
          finishingId: activeFinishing?.id || null,
          fileName: uploadedFile.fileName,
          fileUrl: uploadedFile.url,
          fileSize: uploadedFile.fileSize,
          quantity: Number(quantity) || 1,
          copies: Number(copies) || 1,
          width: activePrintOption.unit === "meter" ? Number(width) : null,
          height: activePrintOption.unit === "meter" ? Number(height) : null,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Gagal membuat pesanan.");
        setSubmitting(false);
        return;
      }

      // Redirect directly to Riwayat Pesanan & trigger payment modal automatically
      router.push(`/pelanggan/riwayat?pay=${data.order.id}`);
    } catch {
      setSubmitError("Terjadi kesalahan jaringan saat menyimpan pesanan.");
      setSubmitting(false);
    }
  }

  if (loadingMaster) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
        Memuat katalog harga master dari database...
      </div>
    );
  }

  if (printOptions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Katalog Layanan Belum Tersedia</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Admin percetakan belum menambahkan daftar jenis dan harga cetak pada Master Data. Silakan hubungi operator atau coba kembali nanti.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2-Step Wizard Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center ${
                step === 1
                  ? "bg-blue-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Langkah 1</p>
              <p className="text-sm font-bold text-slate-900">Spesifikasi & Upload File</p>
            </div>
          </div>

          <div className="h-0.5 flex-1 bg-slate-200 mx-4" />

          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center ${
                step === 2
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              2
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Langkah 2</p>
              <p className="text-sm font-bold text-slate-900">Ringkasan & Checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">
                Pilih Kategori Layanan Cetak
              </h2>
              <div className="flex flex-wrap gap-2">
                {PRINT_CATEGORIES.map((cat) => {
                  const hasItems = printOptions.some((o) => o.category === cat);
                  if (!hasItems) return null;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Jenis Bahan / Ukuran Cetak
                </label>
                <select
                  value={selectedPrintId}
                  onChange={(e) => setSelectedPrintId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {filteredPrintOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} — {formatRupiah(opt.price)} / {opt.unit}
                    </option>
                  ))}
                </select>
                {activePrintOption?.description && (
                  <p className="text-xs text-slate-500 mt-1">{activePrintOption.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Opsi Finishing (Opsional)
                </label>
                <select
                  value={selectedFinishingId}
                  onChange={(e) => setSelectedFinishingId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Tanpa Finishing Tambahan</option>
                  {filteredFinishings.map((fin) => (
                    <option key={fin.id} value={fin.id}>
                      {fin.name} (+{formatRupiah(fin.price)} {fin.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Dimension / Page Inputs */}
            {activePrintOption?.unit === "meter" ? (
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Lebar (Meter)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tinggi / Panjang (Meter)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Jumlah Cetak (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={copies}
                    onChange={(e) => setCopies(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Jumlah ({activePrintOption?.unit || "lembar"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Jumlah Rangkap / Copy
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={copies}
                    onChange={(e) => setCopies(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* File Dropzone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Unggah Dokumen / Desain Siap Cetak
              </label>
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/70 transition">
                <UploadCloud className="w-9 h-9 text-blue-600 mb-2" />
                <span className="text-sm font-semibold text-slate-800">
                  {uploading
                    ? "Mengunggah dokumen ke server..."
                    : "Klik untuk memilih file PDF / Gambar Desain"}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Format disarankan: PDF, PNG, JPG (Maksimal 4,5 MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {uploadedFile && (
                <div className="mt-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {uploadedFile.fileName}
                      </p>
                      <p className="text-xs text-slate-500">{uploadedFile.fileSize}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Siap Cetak
                  </span>
                </div>
              )}

              {uploadError && (
                <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {uploadError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Catatan Tambahan untuk Operator (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Cetak bolak-balik, halaman 1-5 berwarna, sisanya hitam putih..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Live Estimation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit space-y-4 sticky top-24">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Estimasi Biaya Otomatis</span>
            </div>

            <div className="space-y-2.5 text-sm border-y border-slate-100 py-4">
              <div className="flex justify-between text-slate-600">
                <span>Biaya Cetak Dasar</span>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(pricing.baseCost)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Finishing</span>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(pricing.finishingCost)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Total Estimasi</span>
              <span className="text-xl font-extrabold text-blue-600">
                {formatRupiah(pricing.total)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextToStep2}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              Lanjut ke Ringkasan Pesanan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Two-Column Order Summary */}
      {step === 2 && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Specification & Document Verification */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Ringkasan Dokumen & Spesifikasi</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Periksa kembali file dan rincian cetak sebelum pesanan dibuat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Ubah File / Opsi
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {uploadedFile?.fileName}
                  </p>
                  <p className="text-xs text-slate-500">Ukuran: {uploadedFile?.fileSize}</p>
                </div>
              </div>
              <a
                href={uploadedFile?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 hover:underline shrink-0"
              >
                Pratinjau File
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">Kategori & Jenis Cetak</p>
                <p className="font-bold text-slate-900 mt-1">
                  {activePrintOption?.category} — {activePrintOption?.name}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">Opsi Finishing</p>
                <p className="font-bold text-slate-900 mt-1">
                  {activeFinishing ? activeFinishing.name : "Tanpa Finishing Tambahan"}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">Volume / Dimensi</p>
                <p className="font-bold text-slate-900 mt-1">
                  {activePrintOption?.unit === "meter"
                    ? `${width}m x ${height}m (${copies} pcs)`
                    : `${quantity} ${activePrintOption?.unit} x ${copies} rangkap`}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500">Catatan Operator</p>
                <p className="font-medium text-slate-800 mt-1">
                  {notes.trim() || "Tidak ada catatan khusus"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Billing & Confirmation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit space-y-5">
            <h3 className="text-base font-bold text-slate-900">Rincian Tagihan</h3>

            <div className="space-y-3 text-sm border-y border-slate-100 py-4">
              <div className="flex justify-between text-slate-600">
                <span>Cetak Utama</span>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(pricing.baseCost)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Finishing</span>
                <span className="font-semibold text-slate-900">
                  {formatRupiah(pricing.finishingCost)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Layanan Sistem</span>
                <span className="font-semibold text-emerald-600">Rp 0</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
              <span className="text-2xl font-extrabold text-blue-600">
                {formatRupiah(pricing.total)}
              </span>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>
                Saya memastikan file yang diunggah sudah benar dan menyetujui total tagihan pesanan ini.
              </span>
            </label>

            {submitError && (
              <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </p>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleCreateOrder}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-sm transition"
            >
              {submitting ? "Menyimpan Pesanan..." : "Konfirmasi & Buat Pesanan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}