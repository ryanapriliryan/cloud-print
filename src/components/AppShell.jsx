"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Printer,
  LayoutDashboard,
  FilePlus2,
  History,
  UserCircle,
  ClipboardList,
  Database,
  FileBarChart2,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/format";

export default function AppShell({ children, role = "PELANGGAN" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems =
    role === "ADMIN"
      ? [
          { href: "/admin/dashboard", label: "Dasbor Operasional", icon: LayoutDashboard },
          { href: "/admin/kelola-pesanan", label: "Kelola Pesanan", icon: ClipboardList },
          { href: "/admin/master-data", label: "Master Data Harga", icon: Database },
          { href: "/admin/laporan", label: "Laporan Transaksi", icon: FileBarChart2 },
        ]
      : [
          { href: "/pelanggan/dashboard", label: "Dasbor Pelanggan", icon: LayoutDashboard },
          { href: "/pelanggan/buat-pesanan", label: "Buat Pesanan Baru", icon: FilePlus2 },
          { href: "/pelanggan/riwayat", label: "Riwayat Pesanan", icon: History },
          { href: "/pelanggan/profil", label: "Profil Pengguna", icon: UserCircle },
        ];

  const loadHeaderData = useCallback(async () => {
    try {
      const [meRes, notifRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/notifications"),
      ]);
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.unreadCount || 0);
      }
    } catch {
      // ignore transient network errors
    }
  }, []);

  useEffect(() => {
    loadHeaderData();
    const interval = setInterval(loadHeaderData, 20000);
    return () => clearInterval(interval);
  }, [loadHeaderData]);

  async function handleOpenNotifications() {
    const nextState = !notifOpen;
    setNotifOpen(nextState);
    if (nextState && unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Desktop Mengembang (Claymorphism) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 p-4 pr-0 no-print">
        <div className="clay-card flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-5 flex items-center gap-3 border-b border-indigo-100/80">
            <div className="clay-btn-primary w-10 h-10 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 block leading-none tracking-tight">
                Cloud Print
              </span>
              <span className="text-[11px] text-indigo-600 font-bold mt-1 block">
                {role === "ADMIN" ? "Panel Operator" : "Portal Pelanggan"}
              </span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "clay-btn-primary flex items-center gap-3.5 px-4 py-3 text-sm font-bold"
                      : "flex items-center gap-3.5 px-4 py-3 rounded-[18px] text-sm font-bold text-slate-600 hover:bg-white/80 hover:text-indigo-600 transition"
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-indigo-100/80">
            <button
              onClick={handleLogout}
              className="clay-btn-danger w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="clay-card relative m-3 w-72 flex flex-col z-10 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-indigo-100/80">
              <div className="flex items-center gap-2.5">
                <div className="clay-btn-primary w-9 h-9 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900">Cloud Print</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="clay-pill p-2 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={
                      active
                        ? "clay-btn-primary flex items-center gap-3 px-4 py-3 text-sm font-bold"
                        : "flex items-center gap-3 px-4 py-3 rounded-[18px] text-sm font-bold text-slate-600 hover:bg-white/80"
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-indigo-100/80">
              <button
                onClick={handleLogout}
                className="clay-btn-danger w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Sesi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 pt-4 px-4 sm:px-8 no-print">
          <div className="clay-card max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="clay-pill lg:hidden p-2.5 text-slate-700"
                aria-label="Menu Navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {navItems.find((i) => i.href === pathname)?.label || "Cloud Print"}
              </h2>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Bell Notification Popover */}
              <div className="relative">
                <button
                  onClick={handleOpenNotifications}
                  className="clay-pill relative p-2.5 text-slate-700 hover:text-indigo-600"
                  aria-label="Notifikasi"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="clay-card absolute right-0 mt-3 w-80 sm:w-96 z-40 overflow-hidden">
                    <div className="px-5 py-3.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900">Notifikasi</span>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="clay-pill px-3 py-1 text-xs font-bold text-slate-600"
                      >
                        Tutup
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-indigo-100/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs font-medium text-slate-500">
                          Belum ada notifikasi baru.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setNotifOpen(false);
                              if (n.link) router.push(n.link);
                            }}
                            className="p-4 hover:bg-indigo-50/60 cursor-pointer transition"
                          >
                            <p className="text-xs font-extrabold text-slate-900">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] font-semibold text-indigo-500 mt-1">
                              {formatDate(n.createdAt)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Badge */}
              <div className="flex items-center gap-3 pl-3.5 border-l border-indigo-100">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-extrabold text-slate-900 leading-tight">
                    {user?.name || "Memuat..."}
                  </p>
                  <p className="text-[11px] text-indigo-600 font-bold">
                    {role === "ADMIN" ? "Admin / Operator" : "Pelanggan"}
                  </p>
                </div>
                <div className="clay-icon-box w-9 h-9 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}