"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ClipboardCheck, Building2, ShieldCheck, PackageCheck, ArrowRight } from "lucide-react";
import { useAutoRefresh } from "@/lib/useAutoRefresh";

type Overview = {
  pending: number;
  active: number;
  suspended: number;
  rejected: number;
  totalCompanies: number;
  totalPlans: number;
  planBreakdown: { planId: number | null; planName: string; total: number }[];
};

export default function SuperadminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/superadmin/overview");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useAutoRefresh(loadData, 15000);

  const cards = [
    {
      label: "Menunggu Persetujuan",
      value: data?.pending ?? 0,
      icon: ClipboardCheck,
      tone: "bg-amber-50 text-amber-600",
      href: "/superadmin/pendaftaran",
    },
    {
      label: "Perusahaan Aktif",
      value: data?.active ?? 0,
      icon: ShieldCheck,
      tone: "bg-emerald-50 text-emerald-600",
      href: "/superadmin/perusahaan",
    },
    {
      label: "Perusahaan Ditangguhkan",
      value: data?.suspended ?? 0,
      icon: Building2,
      tone: "bg-red-50 text-red-600",
      href: "/superadmin/perusahaan",
    },
    {
      label: "Total Paket Aktif",
      value: data?.totalPlans ?? 0,
      icon: PackageCheck,
      tone: "bg-brand-50 text-brand-600",
      href: "/superadmin/paket",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card flex items-center gap-4 transition-shadow hover:shadow-md">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.tone}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-800">{loading ? "…" : c.value}</p>
              <p className="text-xs text-slate-400">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Distribusi Perusahaan per Paket</h2>
        </div>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Memuat data...</p>
        ) : !data || data.planBreakdown.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Belum ada perusahaan aktif dengan paket.</p>
        ) : (
          <div className="space-y-2">
            {data.planBreakdown.map((p) => (
              <div key={String(p.planId)} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
                <span className="text-slate-600">{p.planName}</span>
                <span className="font-semibold text-slate-800">{p.total} perusahaan</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && (data?.pending ?? 0) > 0 && (
        <Link
          href="/superadmin/pendaftaran"
          className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
        >
          <span>
            Ada <strong>{data?.pending}</strong> pendaftaran perusahaan baru menunggu persetujuan Anda.
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      )}
    </div>
  );
}
