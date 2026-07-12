"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, TrendingDown, Scale, Loader2, ShieldAlert } from "lucide-react";
import LiveIndicator from "@/components/LiveIndicator";
import Badge from "@/components/Badge";
import { can } from "@/lib/rbac";
import { useAutoRefresh } from "@/lib/useAutoRefresh";

const rupiah = (v: number) => `Rp ${Math.round(Math.abs(v)).toLocaleString("id-ID")}${v < 0 ? " (minus)" : ""}`;

type NeracaRow = {
  akunId: number;
  kode: string;
  nama: string;
  tipe: string;
  totalDebit: number;
  totalKredit: number;
  saldo: number;
};
type NeracaData = { rows: NeracaRow[]; grandTotalDebit: number; grandTotalKredit: number; balance: boolean };

type LabaRugiItem = { kode: string; nama: string; total: number };
type LabaRugiData = {
  periode: { start: string; end: string };
  pendapatan: LabaRugiItem[];
  beban: LabaRugiItem[];
  totalPendapatan: number;
  totalBeban: number;
  labaRugi: number;
};

export default function LaporanPage() {
  const { data: session, status } = useSession();
  const canView = can(session?.user?.role, "akuntansi.view");
  const [tab, setTab] = useState<"laba-rugi" | "neraca-saldo">("laba-rugi");

  const [neraca, setNeraca] = useState<NeracaData | null>(null);
  const [labaRugi, setLabaRugi] = useState<LabaRugiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const now = new Date();
  const [start, setStart] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  const [end, setEnd] = useState(() => new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10));

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [neracaRes, labaRugiRes] = await Promise.all([
        fetch("/api/laporan/neraca-saldo"),
        fetch(`/api/laporan/laba-rugi?start=${start}&end=${end}`),
      ]);
      setNeraca(await neracaRes.json());
      setLabaRugi(await labaRugiRes.json());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [start, end]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useAutoRefresh(loadData, 15000);

  return (
    <div className="space-y-4">
      {status === "authenticated" && !canView ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ShieldAlert className="h-8 w-8 text-red-400" />
          <p className="font-medium text-slate-700">Akses ditolak</p>
          <p className="max-w-sm text-sm text-slate-400">
            Anda tidak memiliki izin untuk melihat modul Akuntansi. Hubungi Administrator jika Anda memerlukan akses ini.
          </p>
        </div>
      ) : (
        <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setTab("laba-rugi")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "laba-rugi" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Laba Rugi
          </button>
          <button
            onClick={() => setTab("neraca-saldo")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "neraca-saldo" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Neraca Saldo
          </button>
        </div>
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      {tab === "laba-rugi" && (
        <div className="space-y-4">
          <div className="card flex flex-wrap items-end gap-3">
            <div>
              <label className="label">Dari Tanggal</label>
              <input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="label">Sampai Tanggal</label>
              <input type="date" className="input" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          {loading || !labaRugi ? (
            <div className="card flex h-40 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="card">
                  <div className="mb-1 flex items-center gap-2 text-slate-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Total Pendapatan</span>
                  </div>
                  <p className="text-xl font-semibold text-emerald-600">{rupiah(labaRugi.totalPendapatan)}</p>
                </div>
                <div className="card">
                  <div className="mb-1 flex items-center gap-2 text-slate-400">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Total Beban (termasuk HPP)</span>
                  </div>
                  <p className="text-xl font-semibold text-red-500">{rupiah(labaRugi.totalBeban)}</p>
                </div>
                <div className="card">
                  <div className="mb-1 flex items-center gap-2 text-slate-400">
                    <Scale className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {labaRugi.labaRugi >= 0 ? "Laba Bersih" : "Rugi Bersih"}
                    </span>
                  </div>
                  <p className={`text-xl font-semibold ${labaRugi.labaRugi >= 0 ? "text-brand-600" : "text-red-600"}`}>
                    {rupiah(labaRugi.labaRugi)}
                  </p>
                </div>
              </div>

              <div className="card">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">Pendapatan</h3>
                {labaRugi.pendapatan.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">Belum ada pendapatan di periode ini.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {labaRugi.pendapatan.map((p) => (
                      <div key={p.kode} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-slate-600">
                          {p.kode} · {p.nama}
                        </span>
                        <span className="font-medium text-slate-800">{rupiah(p.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">Beban &amp; Harga Pokok Penjualan</h3>
                {labaRugi.beban.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">Belum ada beban di periode ini.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {labaRugi.beban.map((b) => (
                      <div key={b.kode} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-slate-600">
                          {b.kode} · {b.nama}
                        </span>
                        <span className="font-medium text-slate-800">{rupiah(b.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "neraca-saldo" && (
        <div className="space-y-4">
          <div className="card flex items-start gap-3 bg-brand-50/50">
            <Scale className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm text-slate-600">
              Neraca Saldo menampilkan akumulasi debit &amp; kredit seluruh akun sejak awal (tidak difilter tanggal).
              Jika kolom Total Debit dan Total Kredit di baris paling bawah sudah sama, artinya seluruh jurnal
              (otomatis maupun manual) sudah balance.
            </p>
          </div>

          {loading || !neraca ? (
            <div className="card flex h-40 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Kode</th>
                    <th className="th">Nama Akun</th>
                    <th className="th text-right">Total Debit</th>
                    <th className="th text-right">Total Kredit</th>
                    <th className="th text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {neraca.rows.map((r) => (
                    <tr key={r.akunId} className="hover:bg-slate-50/70">
                      <td className="td font-medium text-slate-600">{r.kode}</td>
                      <td className="td">{r.nama}</td>
                      <td className="td text-right">{r.totalDebit > 0 ? rupiah(r.totalDebit) : "-"}</td>
                      <td className="td text-right">{r.totalKredit > 0 ? rupiah(r.totalKredit) : "-"}</td>
                      <td className="td text-right font-medium">{rupiah(r.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                    <td className="td" colSpan={2}>
                      Total
                    </td>
                    <td className="td text-right">{rupiah(neraca.grandTotalDebit)}</td>
                    <td className="td text-right">{rupiah(neraca.grandTotalKredit)}</td>
                    <td className="td text-right">
                      {neraca.balance ? <Badge tone="green">Balance</Badge> : <Badge tone="red">Tidak Balance</Badge>}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
