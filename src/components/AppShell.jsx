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
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200 no-print">
        <div className="h-16 px-6 flex items-center gap-2.5 border-b border-slate-200">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block leading-none">Cloud Print</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {role === "ADMIN" ? "Panel Operator" : "Portal Pelanggan"}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-white h-full flex flex-col z-10 shadow-xl">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900">Cloud Print</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
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
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
              {navItems.find((i) => i.href === pathname)?.label || "Cloud Print"}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Bell Notification Popover */}
            <div className="relative">
              <button
                onClick={handleOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Notifikasi</span>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
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
                          className="p-3.5 hover:bg-slate-50 cursor-pointer transition"
                        >
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
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
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.name || "Memuat..."}
                </p>
                <p className="text-[11px] text-blue-600 font-medium">
                  {role === "ADMIN" ? "Admin / Operator" : "Pelanggan"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
