"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, X, User } from "lucide-react";

const QUICK_TOPICS = [
  "Tanya harga cetak",
  "Estimasi waktu selesai",
  "Konsultasi ukuran & file",
];

function generateVisitorToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [nameLocked, setNameLocked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasNewReply, setHasNewReply] = useState(false);

  const messagesEndRef = useRef(null);
  const lastCountRef = useRef(0);

  // Inisialisasi token & nama pengunjung dari localStorage
  useEffect(() => {
    let savedToken = localStorage.getItem("cloudprint_chat_token");
    if (!savedToken) {
      savedToken = generateVisitorToken();
      localStorage.setItem("cloudprint_chat_token", savedToken);
    }
    setToken(savedToken);

    const savedName = localStorage.getItem("cloudprint_chat_name");
    if (savedName) {
      setVisitorName(savedName);
      setNameLocked(true);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/chat?token=${encodeURIComponent(token)}`);
      if (!res.ok) return;
      const data = await res.json();
      const list = data.messages || [];

      if (data.session?.visitorName) {
        setVisitorName(data.session.visitorName);
        setNameLocked(true);
        localStorage.setItem("cloudprint_chat_name", data.session.visitorName);
      }

      if (list.length > lastCountRef.current) {
        const newest = list[list.length - 1];
        if (!open && newest?.sender === "ADMIN" && lastCountRef.current > 0) {
          setHasNewReply(true);
        }
        lastCountRef.current = list.length;
      }
      setMessages(list);
    } catch {
      // abaikan error jaringan sementara
    }
  }, [token, open]);

  useEffect(() => {
    if (!token) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, open ? 3500 : 12000);
    return () => clearInterval(interval);
  }, [token, open, fetchMessages]);

  useEffect(() => {
    if (open) {
      setHasNewReply(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  async function handleSendMessage(e) {
    e.preventDefault();
    const trimmedContent = input.trim();
    const trimmedName = visitorName.trim();

    if (!trimmedContent || !token) return;
    if (!nameLocked && !trimmedName) return;

    setSending(true);
    setInput("");

    if (!nameLocked && trimmedName) {
      setNameLocked(true);
      localStorage.setItem("cloudprint_chat_name", trimmedName);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          visitorName: trimmedName || "Pengunjung",
          content: trimmedContent,
        }),
      });
      if (res.ok) {
        await fetchMessages();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Jendela Pop-Up Live Chat Claymorphism */}
      {open && (
        <div className="clay-card w-[calc(100vw-2.5rem)] sm:w-96 mb-4 overflow-hidden flex flex-col max-h-[82vh]">
          {/* Header Chat */}
          <div className="clay-btn-primary rounded-none rounded-t-[26px] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold leading-tight">
                  Live Chat Cloud Print
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[11px] font-medium text-indigo-100">
                    Admin Online • Balas di Sini
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

          {/* Area Riwayat Pesan */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[240px] max-h-[340px]">
            {/* Sapaan Pembuka Otomatis */}
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-extrabold text-indigo-600 mb-1 ml-1">
                Admin Cloud Print
              </span>
              <div className="clay-card-soft px-4 py-3 text-xs text-slate-700 leading-relaxed max-w-[85%]">
                Halo! Selamat datang di <strong>Cloud Print</strong>. Silakan tanyakan harga cetak, jenis bahan, atau estimasi pengerjaan langsung di kolom bawah ini.
              </div>
            </div>

            {messages.map((msg) => {
              const isVisitor = msg.sender === "VISITOR";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isVisitor ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 mb-1 mx-1">
                    {isVisitor ? visitorName || "Anda" : "Admin Cloud Print"} •{" "}
                    {formatTime(msg.createdAt)}
                  </span>
                  <div
                    className={
                      isVisitor
                        ? "clay-btn-primary px-4 py-2.5 text-xs font-medium leading-relaxed max-w-[85%] rounded-2xl rounded-br-sm"
                        : "clay-card-soft px-4 py-2.5 text-xs font-medium text-slate-800 leading-relaxed max-w-[85%] rounded-2xl rounded-bl-sm"
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input & Topik Cepat */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-indigo-100/80 bg-white/50 space-y-2.5 shrink-0"
          >
            {!nameLocked && (
              <div className="relative">
                <User className="w-3.5 h-3.5 text-indigo-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Masukkan nama Anda sebelum bertanya..."
                  className="clay-input w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
            )}

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() =>
                      setInput(`Halo Admin, saya ingin ${topic.toLowerCase()}.`)
                    }
                    className="clay-pill px-2.5 py-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    + {topic}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan ke Admin..."
                className="clay-input flex-1 px-3.5 py-2.5 text-xs font-medium text-slate-800"
              />
              <button
                type="submit"
                disabled={sending || (!nameLocked && !visitorName.trim()) || !input.trim()}
                aria-label="Kirim pesan"
                className="clay-btn-primary p-2.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tombol Mengambang Claymorphism di Pojok Kanan Bawah */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="clay-btn-primary flex items-center gap-2.5 px-5 py-3.5 rounded-full font-extrabold text-xs sm:text-sm cursor-pointer"
      >
        <span className="relative flex items-center justify-center">
          {open ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5" />
              {hasNewReply ? (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white animate-bounce" />
              ) : (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-indigo-600" />
              )}
            </>
          )}
        </span>
        <span>{open ? "Tutup Chat" : "Tanya Admin"}</span>
      </button>
    </div>
  );
}