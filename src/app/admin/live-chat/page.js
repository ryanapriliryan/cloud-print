"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Trash2,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
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
  const [pendingReply, setPendingReply] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [toast, setToast] = useState("");

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const prevMsgCountRef = useRef(0);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 90;
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

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
      prevMsgCountRef.current = 0;
      return;
    }
    try {
      const res = await fetch(`/api/admin/chat/${selectedId}`);
      if (!res.ok) return;
      const data = await res.json();
      const list = data.messages || [];
      const isInitialLoad = prevMsgCountRef.current === 0 && list.length > 0;
      const hasNewMessages = list.length > prevMsgCountRef.current;

      prevMsgCountRef.current = list.length;
      setActiveSession(data.session || null);
      setMessages((prev) => {
        const isSame =
          prev.length === list.length &&
          prev[prev.length - 1]?.id === list[list.length - 1]?.id;
        return isSame ? prev : list;
      });

      if (isInitialLoad) {
        isNearBottomRef.current = true;
        requestAnimationFrame(() => scrollToBottom("auto"));
      } else if (hasNewMessages && isNearBottomRef.current) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }
    } catch {
      // abaikan error jaringan sementara
    }
  }, [selectedId, scrollToBottom]);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  useEffect(() => {
    prevMsgCountRef.current = 0;
    isNearBottomRef.current = true;
    if (!selectedId) return;
    loadConversation();
    const interval = setInterval(loadConversation, 3500);
    return () => clearInterval(interval);
  }, [selectedId, loadConversation]);

  useEffect(() => {
    if (pendingReply) {
      isNearBottomRef.current = true;
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }
  }, [pendingReply, scrollToBottom]);

  async function handleSendReply(e) {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setPendingReply(text);
    setReplyText("");
    isNearBottomRef.current = true;

    try {
      const res = await fetch(`/api/admin/chat/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const createdMsg = data.message || {
          id: `local_${Date.now()}`,
          sender: "ADMIN",
          content: text,
          createdAt: new Date().toISOString(),
        };

        // Langsung gantikan gelembung loading dengan pesan resmi agar tidak ganda
        setPendingReply(null);
        setMessages((prev) => {
          if (prev.some((m) => m.id === createdMsg.id)) return prev;
          const updated = [...prev, createdMsg];
          prevMsgCountRef.current = updated.length;
          return updated;
        });

        requestAnimationFrame(() => scrollToBottom("smooth"));
        loadSessions();
      } else {
        setPendingReply(null);
        setReplyText(text);
      }
    } catch {
      setPendingReply(null);
      setReplyText(text);
    } finally {
      setSending(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || deleting) return;
    const targetId = deleteTarget.id;

    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/chat/${targetId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDeleteError(data.error || "Gagal menghapus percakapan.");
        return;
      }

      setSessions((prev) => prev.filter((item) => item.id !== targetId));
      if (selectedId === targetId) {
        setSelectedId("");
        setActiveSession(null);
        setMessages([]);
      }
      setDeleteTarget(null);
      showToast("Riwayat percakapan berhasil dihapus.");
      await loadSessions();
    } catch {
      setDeleteError("Koneksi terputus saat menghapus percakapan.");
    } finally {
      setDeleting(false);
    }
  }

  // Sembunyikan pendingReply otomatis jika pesan identik sudah masuk lewat polling
  const showPendingBubble =
    pendingReply &&
    !(
      messages.length > 0 &&
      messages[messages.length - 1]?.sender === "ADMIN" &&
      messages[messages.length - 1]?.content === pendingReply
    );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 py-3.5 shadow-[8px_10px_20px_rgba(16,185,129,0.35),inset_3px_3px_6px_rgba(255,255,255,0.4)] text-sm font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="clay-card p-6">
        <h1 className="text-lg font-extrabold text-slate-900">
          Live Chat Pengunjung Beranda
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Balas pertanyaan calon pelanggan dari halaman beranda secara langsung tanpa berpindah aplikasi.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 min-h-[520px]">
        <div
          className={`clay-card overflow-hidden flex flex-col ${
            selectedId ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="px-5 py-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Kotak Masuk ({sessions.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-200/70">
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
                      isSelected ? "clay-pressed rounded-none" : "hover:bg-white/40"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="clay-icon-box icon-emerald w-10 h-10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 truncate">
                          {s.visitorName}
                        </p>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {lastMsg
                            ? `${lastMsg.sender === "ADMIN" ? "Anda: " : ""}${lastMsg.content}`
                            : "Memulai percakapan"}
                        </p>
                        <p className="text-[10px] font-semibold text-cobalt mt-1">
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

        <div
          className={`lg:col-span-2 clay-card overflow-hidden flex flex-col ${
            !selectedId ? "hidden lg:flex" : "flex"
          }`}
        >
          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-3">
              <div className="clay-icon-box icon-cobalt w-14 h-14 flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Pilih percakapan di sebelah kiri untuk mulai membalas
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-blue-50/60 border-b border-slate-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId("")}
                    className="clay-card-soft lg:hidden p-2 text-slate-700"
                    aria-label="Kembali"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="clay-icon-box icon-emerald w-10 h-10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h2 className="text-sm font-extrabold text-slate-900 truncate">
                      {activeSession.visitorName}
                    </h2>
                    <p className="text-[11px] font-medium text-slate-600">
                      Pengunjung Website • Mulai {formatDate(activeSession.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setDeleteTarget({
                      id: activeSession.id,
                      visitorName: activeSession.visitorName,
                    });
                  }}
                  className="clay-btn-danger px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Hapus percakapan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Chat</span>
                </button>
              </div>

              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-5 overflow-y-auto space-y-3.5 max-h-[420px]"
              >
                {messages.map((msg) => {
                  const isAdmin = msg.sender === "ADMIN";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isAdmin ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-500 mb-1 mx-1">
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

                {showPendingBubble && (
                  <div className="flex flex-col items-end animate-pulse">
                    <span className="text-[10px] font-bold text-cobalt mb-1 mx-1 inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Mengirim balasan...
                    </span>
                    <div className="clay-btn-primary opacity-80 px-4 py-3 text-xs sm:text-sm font-medium leading-relaxed max-w-[80%] rounded-2xl rounded-br-sm">
                      {pendingReply}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-slate-200/70 bg-white/40 flex items-center gap-3"
              >
                <input
                  type="text"
                  required
                  disabled={sending}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    sending
                      ? "Sedang mengirim balasan..."
                      : `Balas pesan ke ${activeSession.visitorName}...`
                  }
                  className="clay-input flex-1 px-4 py-3 text-sm font-medium text-slate-800 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="clay-btn-primary px-5 py-3 text-xs sm:text-sm font-bold inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{sending ? "Mengirim..." : "Kirim"}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="clay-card max-w-sm w-full p-7 text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="clay-icon-box icon-rose w-14 h-14 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Hapus Percakapan?
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                Seluruh riwayat pesan dengan{" "}
                <strong className="text-slate-900">
                  {deleteTarget.visitorName}
                </strong>{" "}
                akan dihapus secara permanen.
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
                className="clay-card-soft flex-1 py-3 px-4 text-xs font-bold text-slate-700 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
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

export default function AdminLiveChatPage() {
  return (
    <Suspense
      fallback={
        <div className="clay-card p-10 text-center text-sm font-medium text-slate-600">
          Memuat ruang live chat...
        </div>
      }
    >
      <LiveChatAdminContent />
    </Suspense>
  );
}