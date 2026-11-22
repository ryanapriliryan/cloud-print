"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, X, Loader2, AlertCircle } from "lucide-react";

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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [sendError, setSendError] = useState("");
  const [hasNewReply, setHasNewReply] = useState(false);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastCountRef = useRef(0);
  const isNearBottomRef = useRef(true);

  useEffect(() => {
    let savedToken = localStorage.getItem("cloudprint_chat_token");
    if (!savedToken) {
      savedToken = generateVisitorToken();
      localStorage.setItem("cloudprint_chat_token", savedToken);
    }
    setToken(savedToken);
  }, []);

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 90;
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/chat?token=${encodeURIComponent(token)}`);
      if (!res.ok) return;
      const data = await res.json();
      const list = data.messages || [];

      const hasNewMessages = list.length > lastCountRef.current;
      if (hasNewMessages) {
        const newest = list[list.length - 1];
        if (!open && newest?.sender === "ADMIN" && lastCountRef.current > 0) {
          setHasNewReply(true);
        }
        lastCountRef.current = list.length;
      }

      setMessages((prev) => {
        const isSame =
          prev.length === list.length &&
          prev[prev.length - 1]?.id === list[list.length - 1]?.id;
        return isSame ? prev : list;
      });

      if (hasNewMessages && open && isNearBottomRef.current) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }
    } catch {
      // abaikan error jaringan sementara
    }
  }, [token, open, scrollToBottom]);

  useEffect(() => {
    if (!token) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, open ? 3500 : 12000);
    return () => clearInterval(interval);
  }, [token, open, fetchMessages]);

  useEffect(() => {
    if (open) {
      setHasNewReply(false);
      isNearBottomRef.current = true;
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
  }, [open, scrollToBottom]);

  useEffect(() => {
    if (open && pendingMessage) {
      isNearBottomRef.current = true;
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }
  }, [open, pendingMessage, scrollToBottom]);

  async function handleSendMessage(e) {
    e.preventDefault();
    const trimmedContent = input.trim();

    if (!trimmedContent || !token || sending) return;

    setSendError("");
    setSending(true);
    setPendingMessage(trimmedContent);
    setInput("");
    isNearBottomRef.current = true;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          content: trimmedContent,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const createdMsg = data.message || {
          id: `local_${Date.now()}`,
          sender: "VISITOR",
          content: trimmedContent,
          createdAt: new Date().toISOString(),
        };

        setPendingMessage(null);
        setMessages((prev) => {
          if (prev.some((m) => m.id === createdMsg.id)) return prev;
          const updated = [...prev, createdMsg];
          lastCountRef.current = updated.length;
          return updated;
        });

        requestAnimationFrame(() => scrollToBottom("smooth"));
      } else {
        setPendingMessage(null);
        setInput(trimmedContent);
        setSendError("Pesan gagal terkirim. Silakan coba lagi.");
      }
    } catch {
      setPendingMessage(null);
      setInput(trimmedContent);
      setSendError("Koneksi terputus. Periksa internet Anda.");
    } finally {
      setSending(false);
    }
  }

  const showPendingBubble =
    pendingMessage &&
    !(
      messages.length > 0 &&
      messages[messages.length - 1]?.sender === "VISITOR" &&
      messages[messages.length - 1]?.content === pendingMessage
    );

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="clay-card w-[calc(100vw-2.5rem)] sm:w-96 mb-4 overflow-hidden flex flex-col max-h-[82vh]">
          <div className="clay-btn-primary rounded-none rounded-t-[26px] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold !text-white leading-tight">
                  Live Chat Cloud Print
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[11px] font-medium text-blue-100">
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

          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[240px] max-h-[340px]"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-extrabold text-cobalt mb-1 ml-1">
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
                  <span className="text-[10px] font-bold text-slate-500 mb-1 mx-1">
                    {isVisitor ? "Anda" : "Admin Cloud Print"} •{" "}
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

            {showPendingBubble && (
              <div className="flex flex-col items-end animate-pulse">
                <span className="text-[10px] font-bold text-cobalt mb-1 mx-1 inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Mengirim pesan...
                </span>
                <div className="clay-btn-primary opacity-80 px-4 py-2.5 text-xs font-medium leading-relaxed max-w-[85%] rounded-2xl rounded-br-sm">
                  {pendingMessage}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-200/70 bg-white/40 space-y-2.5 shrink-0"
          >
            {sendError && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{sendError}</span>
              </p>
            )}

            {messages.length === 0 && !showPendingBubble && (
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    disabled={sending}
                    onClick={() =>
                      setInput(`Halo Admin, saya ingin ${topic.toLowerCase()}.`)
                    }
                    className="clay-card-soft px-2.5 py-1 rounded-full text-[10px] font-bold text-cobalt hover:brightness-105 cursor-pointer disabled:opacity-50"
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
                disabled={sending}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  sending ? "Sedang mengirim pesan..." : "Ketik pesan ke Admin..."
                }
                className="clay-input flex-1 px-3.5 py-2.5 text-xs font-medium text-slate-800 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Kirim pesan"
                className="clay-btn-primary p-2.5 disabled:opacity-60 disabled:cursor-not-allowed shrink-0 cursor-pointer flex items-center justify-center"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

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
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 ring-2 ring-blue-700" />
              )}
            </>
          )}
        </span>
        <span>{open ? "Tutup Chat" : "Tanya Admin"}</span>
      </button>
    </div>
  );
}