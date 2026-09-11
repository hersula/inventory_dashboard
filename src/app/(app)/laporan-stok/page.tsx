"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Printer, Loader2, ShieldAlert, PackageSearch, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Badge from "@/components/Badge";
import LiveIndicator from "@/components/LiveIndicator";
import { can } from "@/lib/rbac";
import { useAutoRefresh } from "@/lib/useAutoRefresh";

type BarangRingkas = { id: number; kode: string; nama: string; satuan: string };

type Pergerakan = {
  tanggal: string;
  tipe: "PENGADAAN" | "PENJUALAN" | "RETUR_PEMBELIAN" | "RETUR_PENJUALAN";
  nomor: string;
  pihak: string;
  keterangan: string | null;
  masuk: number;
  keluar: number;
  saldo: number;
};

type KartuStok = {
  barang: { id: number; kode: string; nama: string; satuan: string; stokSaatIni: number };
  saldoAwal: number;
  pergerakan: Pergerakan[];
};

const TIPE_LABEL: Record<Pergerakan["tipe"], string> = {
  PENGADAAN: "Pengadaan",
  PENJUALAN: "Penjualan",
  RETUR_PEMBELIAN: "Retur Pembelian",
  RETUR_PENJUALAN: "Retur Penjualan",
};

const TIPE_TONE: Record<Pergerakan["tipe"], "green" | "amber" | "red" | "brand"> = {
  PENGADAAN: "green",
  PENJUALAN: "amber",
  RETUR_PEMBELIAN: "red",
  RETUR_PENJUALAN: "brand",
};

export default function LaporanStokPage() {
  const { data: session, status } = useSession();
  const canView = can(session?.user?.role, "barang.view");

  const [barangList, setBarangList] = useState<BarangRingkas[]>([]);
  const [barangId, setBarangId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState<KartuStok | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/barang")
      .then((res) => res.json())
      .then((list) => setBarangList(list.map((b: any) => ({ id: b.id, kode: b.kode, nama: b.nama, satuan: b.satuan }))))
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    if (!barangId) {
      setData(null);
      setLoading(false);
      return;
    }
    setRefreshing(true);
    setError("");
    try {
      const params = new URLSearchParams({ barangId });
      if (start) params.set("start", start);
      if (end) params.set("end", end);
      const res = await fetch(`/api/laporan/kartu-stok?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Gagal memuat laporan stok.");
        setData(null);
        return;
      }
      setData(json);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [barangId, start, end]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  useAutoRefresh(loadData, 15000);

  const totals = useMemo(() => {
    if (!data) return { masuk: 0, keluar: 0 };
    return data.pergerakan.reduce(
      (acc, p) => ({ masuk: acc.masuk + p.masuk, keluar: acc.keluar + p.keluar }),
      { masuk: 0, keluar: 0 }
    );
  }, [data]);

  if (status === "authenticated" && !canView) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
        <ShieldAlert className="h-8 w-8 text-red-400" />
        <p className="font-medium text-slate-700">Akses ditolak</p>
        <p className="max-w-sm text-sm text-slate-400">Anda tidak memiliki izin untuk melihat laporan stok barang.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card print-hide flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px]">
            <label className="label">Pilih Barang</label>
            <select className="input" value={barangId} onChange={(e) => setBarangId(e.target.value)}>
              <option value="">-- Pilih barang --</option>
              {barangList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.kode} — {b.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Dari Tanggal</label>
            <input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="label">Sampai Tanggal</label>
            <input type="date" className="input" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
          {data && (
            <button onClick={() => window.print()} className="btn-secondary">
              <Printer className="h-4 w-4" />
              Cetak
            </button>
          )}
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {!barangId ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <PackageSearch className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-400">Pilih barang di atas untuk melihat log aktivitas stoknya.</p>
        </div>
      ) : loading || !data ? (
        <div className="card flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="card print-area sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Barang</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{data.barang.nama}</p>
              <p className="text-sm text-slate-400">
                {data.barang.kode} · {data.barang.satuan}
              </p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 text-slate-400">
                <ArrowDownCircle className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Masuk</span>
              </div>
              <p className="mt-1 text-xl font-semibold text-emerald-600">{totals.masuk}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 text-slate-400">
                <ArrowUpCircle className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Keluar</span>
              </div>
              <p className="mt-1 text-xl font-semibold text-red-500">{totals.keluar}</p>
            </div>
          </div>

          <div className="card print-area p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h3 className="text-sm font-semibold text-slate-700">Log Aktivitas Stok</h3>
              <span className="text-sm text-slate-500">
                Stok saat ini: <strong className="text-slate-800">{data.barang.stokSaatIni}</strong> {data.barang.satuan}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Tanggal</th>
                    <th className="th">Jenis</th>
                    <th className="th">No. Referensi</th>
                    <th className="th">Pihak</th>
                    <th className="th text-right">Masuk</th>
                    <th className="th text-right">Keluar</th>
                    <th className="th text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(start || end) && (
                    <tr className="bg-slate-50/70">
                      <td className="td" colSpan={6}>
                        <span className="italic text-slate-500">Saldo Awal Periode</span>
                      </td>
                      <td className="td text-right font-semibold">{data.saldoAwal}</td>
                    </tr>
                  )}
                  {data.pergerakan.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="td py-10 text-center text-slate-400">
                        Tidak ada pergerakan stok pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    data.pergerakan.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50/70">
                        <td className="td">{new Date(p.tanggal).toLocaleDateString("id-ID")}</td>
                        <td className="td">
                          <Badge tone={TIPE_TONE[p.tipe]}>{TIPE_LABEL[p.tipe]}</Badge>
                        </td>
                        <td className="td font-medium text-slate-600">{p.nomor}</td>
                        <td className="td">{p.pihak}</td>
                        <td className="td text-right text-emerald-600">{p.masuk > 0 ? `+${p.masuk}` : "-"}</td>
                        <td className="td text-right text-red-500">{p.keluar > 0 ? `-${p.keluar}` : "-"}</td>
                        <td className="td text-right font-semibold text-slate-800">{p.saldo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
