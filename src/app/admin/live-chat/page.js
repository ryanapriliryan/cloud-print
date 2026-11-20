"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Trash2,
  User,
  ArrowLeft,
} from "lucide-react";
import { formatDate } from "@/lib/format";

function LiveChatAdminContent() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("session");

  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(initialSessionId || "");
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat");
      if (!res.ok) return;
      const data = await res.json();
      const list = data.sessions || [];
      setSessions(list);
      if (!selectedId && list.length > 0 && window.innerWidth >= 1024) {
        setSelectedId(list[0].id);
      }
    } finally {
      setLoadingList(false);
    }
  }, [selectedId]);

  const loadConversation = useCallback(async () => {
    if (!selectedId) {
      setActiveSession(null);
      setMessages([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/chat/${selectedId}`);
      if (!res.ok) return;
      const data = await res.json();
      setActiveSession(data.session || null);
      setMessages(data.messages || []);
    } catch {
      // ignore transient network errors
    }
  }, [selectedId]);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  useEffect(() => {
    if (!selectedId) return;
    loadConversation();
    const interval = setInterval(loadConversation, 3500);
    return () => clearInterval(interval);
  }, [selectedId, loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendReply(e) {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !selectedId) return;

    setSending(true);
    setReplyText("");
    try {
      const res = await fetch(`/api/admin/chat/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        await Promise.all([loadConversation(), loadSessions()]);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteSession(id) {
    if (!confirm("Hapus riwayat percakapan pengunjung ini?")) return;
    const res = await fetch(`/api/admin/chat/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (selectedId === id) {
        setSelectedId("");
        setActiveSession(null);
        setMessages([]);
      }
      await loadSessions();
    }
  }

  return (
    <div className="space-y-6">
      <div className="clay-card p-6">
        <h1 className="text-lg font-extrabold text-slate-900">
          Live Chat Pengunjung Beranda
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Balas pertanyaan calon pelanggan dari halaman beranda secara langsung tanpa berpindah aplikasi.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 min-h-[520px]">
        {/* Kolom Kiri: Daftar Percakapan Masuk */}
        <div
          className={`clay-card overflow-hidden flex flex-col ${
            selectedId ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="px-5 py-4 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Kotak Masuk ({sessions.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-indigo-100/60">
            {loadingList ? (
              <div className="p-8 text-center text-xs font-medium text-slate-500">
                Memuat percakapan...
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-xs font-medium text-slate-500">
                Belum ada pesan masuk dari pengunjung beranda.
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = s.id === selectedId;
                const lastMsg = s.messages?.[0];
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-left p-4 transition flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-100/75"
                        : "hover:bg-indigo-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="clay-icon-box w-10 h-10 text-indigo-600 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 truncate">
                          {s.visitorName}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {lastMsg
                            ? `${lastMsg.sender === "ADMIN" ? "Anda: " : ""}${lastMsg.content}`
                            : "Memulai percakapan"}
                        </p>
                        <p className="text-[10px] font-semibold text-indigo-500 mt-1">
                          {formatDate(s.lastMessageAt)}
                        </p>
                      </div>
                    </div>

                    {s.unreadByAdmin > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shrink-0">
                        {s.unreadByAdmin}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Ruang Obrolan Aktif */}
        <div
          className={`lg:col-span-2 clay-card overflow-hidden flex flex-col ${
            !selectedId ? "hidden lg:flex" : "flex"
          }`}
        >
          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-3">
              <div className="clay-icon-box w-14 h-14 text-indigo-600 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Pilih percakapan di sebelah kiri untuk mulai membalas
              </p>
            </div>
          ) : (
            <>
              {/* Header Ruang Chat */}
              <div className="px-6 py-4 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId("")}
                    className="clay-pill lg:hidden p-2 text-slate-700"
                    aria-label="Kembali"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="clay-icon-box w-10 h-10 text-indigo-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h2 className="text-sm font-extrabold text-slate-900 truncate">
                      {activeSession.visitorName}
                    </h2>
                    <p className="text-[11px] font-medium text-slate-500">
                      Pengunjung Website • Mulai {formatDate(activeSession.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSession(activeSession.id)}
                  className="clay-btn-danger px-3 py-2 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Hapus percakapan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus Chat</span>
                </button>
              </div>

              {/* Isi Pesan */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 max-h-[420px]">
                {messages.map((msg) => {
                  const isAdmin = msg.sender === "ADMIN";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isAdmin ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 mb-1 mx-1">
                        {isAdmin ? "Anda (Admin)" : activeSession.visitorName} •{" "}
                        {formatDate(msg.createdAt)}
                      </span>
                      <div
                        className={
                          isAdmin
                            ? "clay-btn-primary px-4 py-3 text-xs sm:text-sm font-medium leading-relaxed max-w-[80%] rounded-2xl rounded-br-sm"
                            : "clay-card-soft px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed max-w-[80%] rounded-2xl rounded-bl-sm"
                        }
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Balas Pesan */}
              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-indigo-100/80 bg-white/50 flex items-center gap-3"
              >
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Balas pesan ke ${activeSession.visitorName}...`}
                  className="clay-input flex-1 px-4 py-3 text-sm font-medium text-slate-800"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="clay-btn-primary px-5 py-3 text-xs sm:text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? "Mengirim..." : "Kirim"}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLiveChatPage() {
  return (
    <Suspense
      fallback={
        <div className="clay-card p-10 text-center text-sm font-medium text-slate-500">
          Memuat ruang live chat...
        </div>
      }
    >
      <LiveChatAdminContent />
    </Suspense>
  );
}