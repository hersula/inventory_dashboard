"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Wallet, HandCoins, Loader2, Trash2, ShieldAlert, CheckCircle2 } from "lucide-react";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import LiveIndicator from "@/components/LiveIndicator";
import { can } from "@/lib/rbac";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type Outstanding = {
  id: number;
  nomor: string;
  tanggal: string;
  pihak: string;
  metodeBayar: string;
  total: number;
  totalDibayar: number;
  sisa: number;
};

type Riwayat = {
  id: number;
  nomor: string;
  tanggal: string;
  tipe: "HUTANG" | "PIUTANG";
  jumlah: string | number;
  metodeBayar: string;
  keterangan: string | null;
  user: { name: string };
  referensi: { nomor: string; pihak: string } | null;
};

const rupiah = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;
const METODE_LABEL: Record<string, string> = { TUNAI: "Tunai", KREDIT: "Kredit", TEMPO: "Tempo", TRANSFER: "Transfer" };

export default function PembayaranPage() {
  const { data: session, status } = useSession();
  const canView = can(session?.user?.role, "akuntansi.view");
  const canManage = can(session?.user?.role, "akuntansi.manage");

  const [tab, setTab] = useState<"HUTANG" | "PIUTANG">("HUTANG");
  const [outstanding, setOutstanding] = useState<Outstanding[]>([]);
  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [bayarOpen, setBayarOpen] = useState(false);
  const [selected, setSelected] = useState<Outstanding | null>(null);
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [metodeBayar, setMetodeBayar] = useState<"TUNAI" | "TRANSFER">("TUNAI");
  const [keterangan, setKeterangan] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [outRes, riwayatRes] = await Promise.all([
        fetch(`/api/pembayaran/outstanding?tipe=${tab}`),
        fetch(`/api/pembayaran?tipe=${tab}`),
      ]);
      setOutstanding(await outRes.json());
      setRiwayat(await riwayatRes.json());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useAutoRefresh(loadData, 15000);

  function openBayar(o: Outstanding) {
    setSelected(o);
    setJumlah(String(o.sisa));
    setTanggal(new Date().toISOString().slice(0, 10));
    setMetodeBayar("TUNAI");
    setKeterangan("");
    setError("");
    setBayarOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError("");

    const nilai = Number(jumlah);
    if (!nilai || nilai <= 0) {
      setError("Jumlah pembayaran harus lebih dari 0.");
      return;
    }
    if (nilai > selected.sisa + 0.5) {
      setError(`Jumlah melebihi sisa yang belum dilunasi (${rupiah(selected.sisa)}).`);
      return;
    }

    setSaving(true);
    const res = await fetch("/api/pembayaran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipe: tab,
        referensiId: selected.id,
        tanggal,
        jumlah: nilai,
        metodeBayar,
        keterangan: keterangan || null,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal mencatat pembayaran.");
      return;
    }

    setBayarOpen(false);
    notifyDataChanged();
    loadData();
  }

  async function handleBatalkan(r: Riwayat) {
    if (!confirm(`Batalkan pembayaran ${r.nomor}? Jurnal terkait akan ikut dihapus dan sisa hutang/piutang kembali seperti semula.`)) return;
    const res = await fetch(`/api/pembayaran/${r.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal membatalkan pembayaran.");
      return;
    }
    notifyDataChanged();
    loadData();
  }

  if (status === "authenticated" && !canView) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
        <ShieldAlert className="h-8 w-8 text-red-400" />
        <p className="font-medium text-slate-700">Akses ditolak</p>
        <p className="max-w-sm text-sm text-slate-400">
          Anda tidak memiliki izin untuk melihat modul Pembayaran Hutang & Piutang.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setTab("HUTANG")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "HUTANG" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <HandCoins className="h-4 w-4" />
            Hutang (ke Supplier)
          </button>
          <button
            onClick={() => setTab("PIUTANG")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "PIUTANG" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Wallet className="h-4 w-4" />
            Piutang (dari Pelanggan)
          </button>
        </div>
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      <div className="card">
        <h3 className="mb-1 text-sm font-semibold text-slate-700">
          {tab === "HUTANG" ? "Perlu Dibayar ke Supplier" : "Perlu Ditagih dari Pelanggan"}
        </h3>
        <p className="mb-4 text-xs text-slate-400">
          Hanya transaksi dengan metode bayar Kredit/Tempo yang muncul di sini — transaksi Tunai/Transfer sudah lunas otomatis saat dibuat.
        </p>

        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : outstanding.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            <p className="text-sm text-slate-500">
              {tab === "HUTANG" ? "Tidak ada hutang yang perlu dibayar." : "Tidak ada piutang yang perlu ditagih."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">No. Transaksi</th>
                  <th className="th">Tanggal</th>
                  <th className="th">{tab === "HUTANG" ? "Supplier" : "Pelanggan"}</th>
                  <th className="th">Metode</th>
                  <th className="th text-right">Total</th>
                  <th className="th text-right">Sudah Dibayar</th>
                  <th className="th text-right">Sisa</th>
                  <th className="th">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outstanding.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70">
                    <td className="td font-medium text-slate-600">{o.nomor}</td>
                    <td className="td">{new Date(o.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="td">{o.pihak}</td>
                    <td className="td">
                      <Badge tone="amber">{METODE_LABEL[o.metodeBayar] ?? o.metodeBayar}</Badge>
                    </td>
                    <td className="td text-right">{rupiah(o.total)}</td>
                    <td className="td text-right">{rupiah(o.totalDibayar)}</td>
                    <td className="td text-right font-semibold text-red-600">{rupiah(o.sisa)}</td>
                    <td className="td">
                      {canManage && (
                        <button onClick={() => openBayar(o)} className="btn-primary !px-3 !py-1.5 text-xs">
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Riwayat Pembayaran</h3>
        {riwayat.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Belum ada riwayat pembayaran.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">No. Pembayaran</th>
                  <th className="th">Tanggal</th>
                  <th className="th">Untuk Transaksi</th>
                  <th className="th">{tab === "HUTANG" ? "Supplier" : "Pelanggan"}</th>
                  <th className="th">Metode</th>
                  <th className="th text-right">Jumlah</th>
                  <th className="th">Dicatat oleh</th>
                  {canManage && <th className="th">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayat.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="td font-medium text-slate-600">{r.nomor}</td>
                    <td className="td">{new Date(r.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="td">{r.referensi?.nomor ?? "-"}</td>
                    <td className="td">{r.referensi?.pihak ?? "-"}</td>
                    <td className="td">{METODE_LABEL[r.metodeBayar] ?? r.metodeBayar}</td>
                    <td className="td text-right font-medium">{rupiah(Number(r.jumlah))}</td>
                    <td className="td">{r.user?.name ?? "-"}</td>
                    {canManage && (
                      <td className="td">
                        <button
                          onClick={() => handleBatalkan(r)}
                          className="icon-btn hover:bg-red-50 hover:text-red-600"
                          title="Batalkan pembayaran"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={bayarOpen}
        onClose={() => setBayarOpen(false)}
        title={`Catat Pembayaran ${tab === "HUTANG" ? "Hutang" : "Piutang"}`}
      >
        {selected && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">No. Transaksi</span>
                <span className="font-medium text-slate-700">{selected.nomor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{tab === "HUTANG" ? "Supplier" : "Pelanggan"}</span>
                <span className="font-medium text-slate-700">{selected.pihak}</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-1">
                <span className="text-slate-500">Sisa Belum Dilunasi</span>
                <span className="font-semibold text-red-600">{rupiah(selected.sisa)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Jumlah Dibayar</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  max={selected.sisa}
                  required
                  className="input"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Tanggal</label>
                <input type="date" required className="input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Metode Pembayaran</label>
              <select className="input" value={metodeBayar} onChange={(e) => setMetodeBayar(e.target.value as "TUNAI" | "TRANSFER")}>
                <option value="TUNAI">Tunai (Kas)</option>
                <option value="TRANSFER">Transfer Bank</option>
              </select>
            </div>

            <div>
              <label className="label">Keterangan (opsional)</label>
              <textarea className="input" rows={2} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
            </div>

            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setBayarOpen(false)} className="btn-secondary">
                Batal
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan Pembayaran
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
