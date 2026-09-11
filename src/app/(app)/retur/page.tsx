"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { PackageMinus, PackagePlus, Loader2, Trash2, ShieldAlert, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import LiveIndicator from "@/components/LiveIndicator";
import { can } from "@/lib/rbac";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type Jenis = "PEMBELIAN" | "PENJUALAN";

type TrxRingkas = { id: number; nomor: string; tanggal: string; supplier?: { nama: string } | null; pelanggan?: { nama: string } | null };

type SumberItem = {
  barangId: number;
  kode: string;
  nama: string;
  satuan: string;
  qtyAsal: number;
  hargaSatuan: string | number;
  sudahDiretur: number;
  sisaBisaDiretur: number;
};

type Sumber = { nomor: string; tanggal: string; metodeBayar: string; pihak: string; items: SumberItem[] };

type Riwayat = {
  id: number;
  nomor: string;
  tanggal: string;
  catatan: string | null;
  total: string | number;
  user: { name: string };
  referensi: { nomor: string; pihak: string } | null;
  detail: { qty: number; barang: { nama: string; kode: string } }[];
};

const rupiah = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;

export default function ReturPage() {
  const { data: session, status } = useSession();
  const canView = can(session?.user?.role, "retur.view");
  const canManage = can(session?.user?.role, "retur.manage");

  const [tab, setTab] = useState<Jenis>("PEMBELIAN");
  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);
  const [trxList, setTrxList] = useState<TrxRingkas[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [referensiId, setReferensiId] = useState("");
  const [sumber, setSumber] = useState<Sumber | null>(null);
  const [loadingSumber, setLoadingSumber] = useState(false);
  const [qtyMap, setQtyMap] = useState<Record<number, string>>({});
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [riwayatRes, trxRes] = await Promise.all([
        fetch(`/api/retur?jenis=${tab}`),
        fetch(tab === "PEMBELIAN" ? "/api/pengadaan" : "/api/penjualan"),
      ]);
      if (riwayatRes.ok) setRiwayat(await riwayatRes.json());
      if (trxRes.ok) setTrxList(await trxRes.json());
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

  function openCreate() {
    setReferensiId("");
    setSumber(null);
    setQtyMap({});
    setTanggal(new Date().toISOString().slice(0, 10));
    setCatatan("");
    setError("");
    setModalOpen(true);
  }

  async function handlePilihTransaksi(id: string) {
    setReferensiId(id);
    setSumber(null);
    setQtyMap({});
    setError("");
    if (!id) return;
    setLoadingSumber(true);
    try {
      const res = await fetch(`/api/retur/sumber?jenis=${tab}&referensiId=${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memuat detail transaksi.");
        return;
      }
      setSumber(data);
    } finally {
      setLoadingSumber(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!sumber) return;
    setError("");

    const items = Object.entries(qtyMap)
      .map(([barangId, qty]) => ({ barangId: Number(barangId), qty: Number(qty) }))
      .filter((i) => i.qty > 0);

    if (items.length === 0) {
      setError("Isi qty minimal 1 barang yang mau diretur.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/retur", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jenis: tab, referensiId: Number(referensiId), tanggal, catatan: catatan || null, items }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menyimpan retur.");
      return;
    }

    setModalOpen(false);
    notifyDataChanged();
    loadData();
  }

  async function handleBatalkan(r: Riwayat) {
    if (!confirm(`Batalkan retur ${r.nomor}? Stok & jurnal terkait akan dikembalikan seperti semula.`)) return;
    const res = await fetch(`/api/retur/${r.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal membatalkan retur.");
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
        <p className="max-w-sm text-sm text-slate-400">Anda tidak memiliki izin untuk melihat modul Retur Barang.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setTab("PEMBELIAN")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "PEMBELIAN" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <PackageMinus className="h-4 w-4" />
            Retur Pembelian
          </button>
          <button
            onClick={() => setTab("PENJUALAN")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "PENJUALAN" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <PackagePlus className="h-4 w-4" />
            Retur Penjualan
          </button>
        </div>
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Riwayat Retur {tab === "PEMBELIAN" ? "Pembelian (ke Supplier)" : "Penjualan (dari Pelanggan)"}
          </h3>
          {canManage && (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              Buat Retur
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : riwayat.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Belum ada retur {tab === "PEMBELIAN" ? "pembelian" : "penjualan"}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">No. Retur</th>
                  <th className="th">Tanggal</th>
                  <th className="th">Untuk Transaksi</th>
                  <th className="th">{tab === "PEMBELIAN" ? "Supplier" : "Pelanggan"}</th>
                  <th className="th">Barang</th>
                  <th className="th text-right">Total</th>
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
                    <td className="td text-xs text-slate-500">
                      {r.detail.map((d) => `${d.barang.nama} (${d.qty})`).join(", ")}
                    </td>
                    <td className="td text-right font-medium">{rupiah(Number(r.total))}</td>
                    <td className="td">{r.user?.name ?? "-"}</td>
                    {canManage && (
                      <td className="td">
                        <button
                          onClick={() => handleBatalkan(r)}
                          className="icon-btn hover:bg-red-50 hover:text-red-600"
                          title="Batalkan retur"
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Buat Retur ${tab === "PEMBELIAN" ? "Pembelian" : "Penjualan"}`}
        widthClass="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{tab === "PEMBELIAN" ? "Transaksi Pengadaan" : "Transaksi Penjualan"}</label>
            <select required className="input" value={referensiId} onChange={(e) => handlePilihTransaksi(e.target.value)}>
              <option value="">-- Pilih transaksi --</option>
              {trxList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nomor} — {t.supplier?.nama ?? t.pelanggan?.nama ?? "Umum"} ({new Date(t.tanggal).toLocaleDateString("id-ID")})
                </option>
              ))}
            </select>
          </div>

          {loadingSumber && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          )}

          {sumber && (
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
                <span className="text-slate-500">{tab === "PEMBELIAN" ? "Supplier" : "Pelanggan"}:</span>{" "}
                <span className="font-medium text-slate-700">{sumber.pihak}</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full min-w-max text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="th">Barang</th>
                      <th className="th text-right">Qty Asal</th>
                      <th className="th text-right">Sudah Diretur</th>
                      <th className="th text-right">Qty Retur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sumber.items.map((it) => (
                      <tr key={it.barangId}>
                        <td className="td">
                          {it.nama} <span className="text-xs text-slate-400">({it.kode})</span>
                        </td>
                        <td className="td text-right">
                          {it.qtyAsal} {it.satuan}
                        </td>
                        <td className="td text-right text-slate-400">{it.sudahDiretur}</td>
                        <td className="td text-right">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={it.sisaBisaDiretur}
                            disabled={it.sisaBisaDiretur === 0}
                            className="input w-24 text-right disabled:bg-slate-100"
                            value={qtyMap[it.barangId] ?? ""}
                            onChange={(e) => setQtyMap({ ...qtyMap, [it.barangId]: e.target.value })}
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Tanggal Retur</label>
                  <input type="date" required className="input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
                </div>
                <div>
                  <label className="label">Catatan (opsional)</label>
                  <input className="input" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: barang rusak" />
                </div>
              </div>
            </div>
          )}

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={saving || !sumber} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Retur
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
