"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  BookOpen,
  ScrollText,
  BarChart3,
  X,
} from "lucide-react";
import { can, Role } from "@/lib/rbac";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: Parameters<typeof can>[1];
  section: string;
};

// Menambah modul baru cukup tambahkan satu entri di sini — atur `section`
// untuk mengelompokkannya di bawah judul yang sesuai (atau bikin section baru).
const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view", section: "Utama" },
  { href: "/master-barang", label: "Master Barang", icon: Package, permission: "barang.view", section: "Utama" },
  { href: "/pengadaan", label: "Pengadaan Barang", icon: ShoppingCart, permission: "pengadaan.view", section: "Utama" },
  { href: "/penjualan", label: "Penjualan Barang", icon: Receipt, permission: "penjualan.view", section: "Utama" },
  { href: "/akuntansi", label: "Chart of Akun", icon: BookOpen, permission: "akuntansi.view", section: "Akuntansi" },
  { href: "/akuntansi/jurnal", label: "Jurnal Umum", icon: ScrollText, permission: "akuntansi.view", section: "Akuntansi" },
  { href: "/akuntansi/laporan", label: "Laporan Keuangan", icon: BarChart3, permission: "akuntansi.view", section: "Akuntansi" },
  { href: "/users", label: "Manajemen User", icon: Users, permission: "users.manage", section: "Administrasi" },
];

export default function Sidebar({
  role,
  companyName,
  open,
  onClose,
}: {
  role: Role;
  companyName: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => can(role, item.permission));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-200 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600">
              <Boxes className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-base font-semibold text-white">Inventory</span>
              <span className="block truncate text-xs text-slate-400" title={companyName}>
                {companyName}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-800 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {visibleItems.map((item, idx) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const showSectionLabel = idx === 0 || visibleItems[idx - 1].section !== item.section;
            return (
              <div key={item.href}>
                {showSectionLabel && (
                  <p className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${idx === 0 ? "" : "mt-4"}`}>
                    {item.section}
                  </p>
                )}
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
          Inventory Dashboard v1.0
        </div>
      </aside>
    </>
  );
}
