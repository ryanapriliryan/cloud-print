"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, X, AlertCircle } from "lucide-react";

const QUICK_TOPICS = [
  "Tanya harga cetak",
  "Estimasi waktu selesai",
  "Konsultasi ukuran & file",
];

function normalizeWhatsAppNumber(raw) {
  if (!raw) return "";
  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  } else if (digits.startsWith("8")) {
    digits = "62" + digits;
  }
  return digits;
}

export default function WhatsAppChatWidget() {
  const [open, setOpen] = useState(false);
  const [storeName, setStoreName] = useState("Cloud Print");
  const [storePhone, setStorePhone] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/master-data")
      .then((res) => res.json())
      .then((data) => {
        if (data?.storeSetting) {
          if (data.storeSetting.storeName) {
            setStoreName(data.storeSetting.storeName);
          }
          if (data.storeSetting.storePhone) {
            setStorePhone(data.storeSetting.storePhone);
          }
        }
      })
      .catch(() => {});
  }, []);

  const waNumber = normalizeWhatsAppNumber(storePhone);

  function handleSendWhatsApp(e) {
    e.preventDefault();
    if (!waNumber || !message.trim()) return;

    const guestName = senderName.trim() || "Calon Pelanggan";
    const text = [
      `Halo Admin *${storeName}*, perkenalkan saya *${guestName}*.`,
      "",
      "Saya ingin bertanya melalui website:",
      `"${message.trim()}"`,
    ].join("\n");

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Jendela Pop-Up Chat Claymorphism */}
      {open && (
        <div className="clay-card w-[calc(100vw-2.5rem)] sm:w-96 mb-4 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Chat */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold leading-tight">
                  Admin {storeName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-lime-300 animate-pulse" />
                  <span className="text-[11px] font-medium text-emerald-50">
                    Terhubung ke WhatsApp
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Badan Chat & Formulir */}
          <div className="p-5 space-y-4">
            {/* Bubble Sapaan Admin */}
            <div className="clay-card-soft p-3.5 text-xs text-slate-700 leading-relaxed">
              Halo! Ada yang bisa kami bantu seputar cetak dokumen, banner, stiker, atau kartu nama? Tulis pertanyaan Anda di bawah ini.
            </div>

            {!waNumber && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Nomor WhatsApp toko belum diisi oleh Admin pada menu <strong>Master Data</strong>.
                </span>
              </div>
            )}

            <form onSubmit={handleSendWhatsApp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Anda
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="clay-input w-full px-3.5 py-2.5 text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Topik Cepat
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() =>
                        setMessage((prev) =>
                          prev ? `${prev} (${topic})` : `Halo, saya ingin ${topic.toLowerCase()}.`
                        )
                      }
                      className="clay-pill px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      + {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pertanyaan / Pesan
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pertanyaan Anda di sini..."
                  className="clay-input w-full px-3.5 py-2.5 text-xs font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={!waNumber}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-[6px_8px_18px_rgba(16,185,129,0.35),inset_3px_3px_6px_rgba(255,255,255,0.4)] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim ke WhatsApp Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tombol Mengambang Claymorphism di Pojok Kanan Bawah */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-[8px_10px_22px_rgba(16,185,129,0.38),inset_3px_3px_7px_rgba(255,255,255,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
      >
        <span className="relative flex items-center justify-center">
          {open ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-lime-300 ring-2 ring-emerald-600" />
            </>
          )}
        </span>
        <span>{open ? "Tutup Chat" : "Tanya Admin"}</span>
      </button>
    </div>
  );
}