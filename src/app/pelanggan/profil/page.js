"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function PelangganProfilPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setForm({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            newPassword: "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memperbarui profil.");
      } else {
        setSuccess("Profil pengguna berhasil diperbarui.");
        setForm((prev) => ({ ...prev, newPassword: "" }));
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="clay-card max-w-2xl p-10 text-center text-sm font-medium text-slate-500">
        Memuat data profil...
      </div>
    );
  }

  return (
    <div className="clay-card max-w-2xl p-7 sm:p-9 space-y-6">
      <div className="flex items-center gap-3.5">
        <div className="clay-icon-box w-12 h-12 text-indigo-600 flex items-center justify-center shrink-0">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">Profil Pengguna</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Perbarui informasi kontak atau kata sandi akun pelanggan Anda.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-100/85 border border-white text-emerald-800 text-sm font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="clay-btn-danger p-4 text-sm font-bold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Nama Lengkap
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Alamat Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Nomor WhatsApp / HP
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Kata Sandi Baru (Kosongkan jika tidak ingin mengganti)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-indigo-500 absolute left-4 top-3.5" />
            <input
              type="password"
              minLength={6}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Minimal 6 karakter"
              className="clay-input w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="clay-btn-primary px-6 py-3 font-bold text-sm"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}