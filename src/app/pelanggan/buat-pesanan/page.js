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
import ClaySelect from "@/components/ClaySelect";

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

      router.push(`/pelanggan/riwayat?pay=${data.order.id}`);
    } catch {
      setSubmitError("Terjadi kesalahan jaringan saat menyimpan pesanan.");
      setSubmitting(false);
    }
  }

  if (loadingMaster) {
    return (
      <div className="clay-card p-10 text-center text-sm font-medium text-slate-600">
        Memuat katalog harga master dari database...
      </div>
    );
  }

  if (printOptions.length === 0) {
    return (
      <div className="clay-card p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Katalog Layanan Belum Tersedia</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Admin percetakan belum menambahkan daftar jenis dan harga cetak pada Master Data. Silakan hubungi operator atau coba kembali nanti.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* 2-Step Wizard Header */}
      <div className="clay-card p-6">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-2xl font-extrabold text-sm flex items-center justify-center shadow-md ${
                step === 1
                  ? "clay-btn-primary"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              }`}
            >
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
            </div>
            <div>
              <p className="text-xs text-indigo-500 font-bold">Langkah 1</p>
              <p className="text-sm font-extrabold text-slate-900">Spesifikasi & Upload File</p>
            </div>
          </div>

          <div className="h-1 flex-1 rounded-full bg-indigo-100 mx-4 shadow-inner" />

          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-2xl font-extrabold text-sm flex items-center justify-center ${
                step === 2 ? "clay-btn-primary" : "clay-pill text-slate-400"
              }`}
            >
              2
            </div>
            <div>
              <p className="text-xs text-indigo-500 font-bold">Langkah 2</p>
              <p className="text-sm font-extrabold text-slate-900">Ringkasan & Checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="grid lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2 clay-card p-7 space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 mb-3.5">
                Pilih Kategori Layanan Cetak
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {PRINT_CATEGORIES.map((cat) => {
                  const hasItems = printOptions.some((o) => o.category === cat);
                  if (!hasItems) return null;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={
                        isActive
                          ? "clay-btn-primary px-4 py-2.5 text-xs font-bold"
                          : "clay-pill px-4 py-2.5 text-xs font-bold text-slate-700"
                      }
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Jenis Bahan / Ukuran Cetak
                </label>
                <ClaySelect
                  value={selectedPrintId}
                  onChange={(val) => setSelectedPrintId(val)}
                  options={filteredPrintOptions.map((opt) => ({
                    value: opt.id,
                    label: `${opt.name} — ${formatRupiah(opt.price)} / ${opt.unit}`,
                  }))}
                  className="text-sm font-semibold"
                />
                {activePrintOption?.description && (
                  <p className="text-xs text-slate-500 mt-1.5">{activePrintOption.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Opsi Finishing (Opsional)
                </label>
                <ClaySelect
                  value={selectedFinishingId}
                  onChange={(val) => setSelectedFinishingId(val)}
                  options={[
                    { value: "", label: "Tanpa Finishing Tambahan" },
                    ...filteredFinishings.map((fin) => ({
                      value: fin.id,
                      label: `${fin.name} (+${formatRupiah(fin.price)} ${fin.unit})`,
                    })),
                  ]}
                  className="text-sm font-semibold"
                />
              </div>
            </div>

            {/* Dynamic Dimension / Page Inputs */}
            {activePrintOption?.unit === "meter" ? (
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Lebar (Meter)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="clay-input w-full px-4 py-3 text-sm font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tinggi / Panjang (Meter)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="clay-input w-full px-4 py-3 text-sm font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Jumlah Cetak (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={copies}
                    onChange={(e) => setCopies(e.target.value)}
                    className="clay-input w-full px-4 py-3 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Jumlah ({activePrintOption?.unit || "lembar"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="clay-input w-full px-4 py-3 text-sm font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Jumlah Rangkap / Copy
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={copies}
                    onChange={(e) => setCopies(e.target.value)}
                    className="clay-input w-full px-4 py-3 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* File Dropzone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Unggah Dokumen / Desain Siap Cetak
              </label>
              <label className="clay-dropzone p-7 flex flex-col items-center justify-center text-center cursor-pointer">
                <div className="clay-icon-box w-14 h-14 flex items-center justify-center mb-3">
                  <UploadCloud className="w-7 h-7 text-indigo-600" />
                </div>
                <span className="text-sm font-extrabold text-slate-800">
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
                <div className="clay-card-soft mt-4 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="clay-icon-box w-10 h-10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {uploadedFile.fileName}
                      </p>
                      <p className="text-xs text-slate-500">{uploadedFile.fileSize}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/90 px-3 py-1.5 rounded-full shadow-xs">
                    Siap Cetak
                  </span>
                </div>
              )}

              {uploadError && (
                <p className="mt-2.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {uploadError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Catatan Tambahan untuk Operator (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Cetak bolak-balik, halaman 1-5 berwarna, sisanya hitam putih..."
                className="clay-input w-full px-4 py-3 text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Live Estimation Card */}
          <div className="clay-card p-7 h-fit space-y-5 sticky top-24">
            <div className="flex items-center gap-2.5 text-indigo-600 font-extrabold text-sm">
              <div className="clay-icon-box w-9 h-9 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <span>Estimasi Biaya Otomatis</span>
            </div>

            <div className="clay-card-soft p-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Biaya Cetak Dasar</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(pricing.baseCost)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Finishing</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(pricing.finishingCost)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-extrabold text-slate-800">Total Estimasi</span>
              <span className="text-2xl font-black text-indigo-600">
                {formatRupiah(pricing.total)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextToStep2}
              className="clay-btn-primary w-full py-3.5 px-4 font-bold text-sm flex items-center justify-center gap-2"
            >
              Lanjut ke Ringkasan Pesanan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="grid lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2 clay-card p-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Ringkasan Dokumen & Spesifikasi</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Periksa kembali file dan rincian cetak sebelum pesanan dibuat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="clay-pill px-3.5 py-2 text-xs font-bold text-indigo-600 inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Ubah File / Opsi
              </button>
            </div>

            <div className="clay-card-soft p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="clay-icon-box w-11 h-11 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-extrabold text-slate-900 truncate">
                    {uploadedFile?.fileName}
                  </p>
                  <p className="text-xs text-slate-500">Ukuran: {uploadedFile?.fileSize}</p>
                </div>
              </div>
              <a
                href={uploadedFile?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="clay-pill px-3.5 py-2 text-xs font-bold text-indigo-600 shrink-0"
              >
                Pratinjau File
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="clay-card-soft p-4">
                <p className="text-xs text-slate-500 font-semibold">Kategori & Jenis Cetak</p>
                <p className="font-extrabold text-slate-900 mt-1">
                  {activePrintOption?.category} — {activePrintOption?.name}
                </p>
              </div>
              <div className="clay-card-soft p-4">
                <p className="text-xs text-slate-500 font-semibold">Opsi Finishing</p>
                <p className="font-extrabold text-slate-900 mt-1">
                  {activeFinishing ? activeFinishing.name : "Tanpa Finishing Tambahan"}
                </p>
              </div>
              <div className="clay-card-soft p-4">
                <p className="text-xs text-slate-500 font-semibold">Volume / Dimensi</p>
                <p className="font-extrabold text-slate-900 mt-1">
                  {activePrintOption?.unit === "meter"
                    ? `${width}m x ${height}m (${copies} pcs)`
                    : `${quantity} ${activePrintOption?.unit} x ${copies} rangkap`}
                </p>
              </div>
              <div className="clay-card-soft p-4">
                <p className="text-xs text-slate-500 font-semibold">Catatan Operator</p>
                <p className="font-semibold text-slate-800 mt-1">
                  {notes.trim() || "Tidak ada catatan khusus"}
                </p>
              </div>
            </div>
          </div>

          <div className="clay-card p-7 h-fit space-y-5">
            <h3 className="text-base font-extrabold text-slate-900">Rincian Tagihan</h3>

            <div className="clay-card-soft p-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Cetak Utama</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(pricing.baseCost)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Finishing</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(pricing.finishingCost)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Layanan Sistem</span>
                <span className="font-bold text-emerald-600">Rp 0</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900">Total Pembayaran</span>
              <span className="text-2xl font-black text-indigo-600">
                {formatRupiah(pricing.total)}
              </span>
            </div>

            <label className="clay-card-soft flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer p-3.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium leading-relaxed">
                Saya memastikan file yang diunggah sudah benar dan menyetujui total tagihan pesanan ini.
              </span>
            </label>

            {submitError && (
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </p>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleCreateOrder}
              className="clay-btn-primary w-full py-3.5 px-4 font-bold text-sm"
            >
              {submitting ? "Menyimpan Pesanan..." : "Konfirmasi & Buat Pesanan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}