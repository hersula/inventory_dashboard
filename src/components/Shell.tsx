"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Role } from "@/lib/rbac";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/master-barang": "Master Barang",
  "/pengadaan": "Pengadaan Barang",
  "/penjualan": "Penjualan Barang",
  "/akuntansi/jurnal": "Jurnal Umum",
  "/akuntansi/laporan": "Laporan Keuangan",
  "/akuntansi": "Chart of Akun",
  "/users": "Manajemen User",
};

function resolveTitle(pathname: string) {
  // Urutkan dari path paling spesifik (terpanjang) supaya "/akuntansi/jurnal"
  // dicek lebih dulu daripada "/akuntansi" yang merupakan prefix-nya.
  const match = Object.keys(titleMap)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(key + "/"));
  return match ? titleMap[match] : "Inventory Dashboard";
}

export default function Shell({
  name,
  role,
  companyName,
  children,
}: {
  name: string;
  role: Role;
  companyName: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={role} companyName={companyName} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Header
          name={name}
          role={role}
          title={resolveTitle(pathname || "")}
          onMenuClick={() => setSidebarOpen(true)}
        />
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
