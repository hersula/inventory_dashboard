"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ShieldCheck,
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  PackageCheck,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { href: "/superadmin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { href: "/superadmin/pendaftaran", label: "Pendaftaran Perusahaan", icon: ClipboardCheck, exact: false },
  { href: "/superadmin/perusahaan", label: "Perusahaan & Langganan", icon: Building2, exact: false },
  { href: "/superadmin/paket", label: "Paket Langganan", icon: PackageCheck, exact: false },
];

const titleMap: Record<string, string> = {
  "/superadmin": "Ringkasan",
  "/superadmin/pendaftaran": "Pendaftaran Perusahaan",
  "/superadmin/perusahaan": "Perusahaan & Langganan",
  "/superadmin/paket": "Paket Langganan",
};

export default function SuperadminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || "";
  const title = titleMap[pathname] ?? "Super Admin";

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-200 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-base font-semibold text-white">Super Admin</span>
              <span className="block truncate text-xs text-slate-400">Platform Inventory Dashboard</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-md p-1 hover:bg-slate-800 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-amber-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">Super Admin Console</div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header
          className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6"
          style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(4rem + env(safe-area-inset-top))" }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-md p-2 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-base font-semibold text-slate-800 sm:text-lg">{title}</h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white">
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight text-slate-800">{name}</p>
                <p className="text-xs leading-tight text-slate-400">Super Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main
          className="flex-1 p-4 sm:p-6"
          style={{
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            paddingLeft: "max(1rem, env(safe-area-inset-left))",
            paddingRight: "max(1rem, env(safe-area-inset-right))",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
