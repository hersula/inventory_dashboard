"use client";

import { useEffect, useState, useCallback, useMemo, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { ClipboardCheck, Loader2, Trash2, ShieldAlert, Plus } from "lucide-react";
import Modal from "@/components/Modal";
import LiveIndicator from "@/components/LiveIndicator";
import { can } from "@/lib/rbac";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type BarangItem = { id: number; kode: string; nama: string; satuan: string; stok: number };

type DetailOpname = {
  barangId: number;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  nilaiSelisih: string | number;
  barang: { nama: string; kode: string; satuan: string };
};

type Riwayat = {
  id: number;
  nomor: string;
  tanggal: string;
  catatan: string | null;
  totalNilaiSelisih: string | number;
  user: { name: string };
  detail: DetailOpname[];
};

const rupiah = (v: number) => `Rp ${Math.round(Math.abs(v)).toLocaleString("id-ID")}`;

function SelisihNilai({ value }: { value: number }) {
  if (value > 0) return <span className="font-medium text-emerald-600">+{rupiah(value)}</span>;
  if (value < 0) return <span className="font-medium text-red-600">-{rupiah(value)}</span>;
  return <span className="text-slate-400">Rp 0</span>;
}

export default function StockOpnamePage() {
  const { data: session, status } = useSession();
  const canView = can(session?.user?.role, "opname.view");
  const canManage = can(session?.user?.role, "opname.manage");

  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [barangList, setBarangList] = useState<BarangItem[]>([]);
  const [loadingBarang, setLoadingBarang] = useState(false);
  const [search, setSearch] = useState("");
  const [stokFisikMap, setStokFisikMap] = useState<Record<number, string>>({});
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/opname");
      if (res.ok) setRiwayat(await res.json());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useAutoRefresh(loadData, 15000);

  async function openCreate() {
    setSearch("");
    setStokFisikMap({});
    setTanggal(new Date().toISOString().slice(0, 10));
    setCatatan("");
    setError("");
    setModalOpen(true);
    setLoadingBarang(true);
    try {
      const res = await fetch("/api/barang");
      if (res.ok) setBarangList(await res.json());
    } finally {
      setLoadingBarang(false);
    }
  }

  const filteredBarang = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return barangList;
    return barangList.filter((b) => b.nama.toLowerCase().includes(q) || b.kode.toLowerCase().includes(q));
  }, [barangList, search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const items = Object.entries(stokFisikMap)
      .filter(([, v]) => v.trim() !== "")
      .map(([barangId, v]) => ({ barangId: Number(barangId), stokFisik: Number(v) }));

    if (items.length === 0) {
      setError("Isi stok fisik minimal 1 barang yang dihitung.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/opname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tanggal, catatan: catatan || null, items }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menyimpan stock opname.");
      return;
    }

    setModalOpen(false);
    notifyDataChanged();
    loadData();
  }

  async function handleBatalkan(r: Riwayat) {
    if (!confirm(`Batalkan stock opname ${r.nomor}? Stok & jurnal terkait akan dikembalikan seperti semula.`)) return;
    const res = await fetch(`/api/opname/${r.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal membatalkan stock opname.");
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
        <p className="max-w-sm text-sm text-slate-400">Anda tidak memiliki izin untuk melihat modul Stock Opname.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Hitung fisik stok gudang dan bandingkan dengan stok sistem.</p>
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Riwayat Stock Opname</h3>
          {canManage && (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              Opname Baru
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : riwayat.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Belum ada stock opname.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">No. Opname</th>
                  <th className="th">Tanggal</th>
                  <th className="th text-right">Barang Dihitung</th>
                  <th className="th">Barang Berselisih</th>
                  <th className="th text-right">Nilai Selisih</th>
                  <th className="th">Dicatat oleh</th>
                  {canManage && <th className="th">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayat.map((r) => {
                  const berselisih = r.detail.filter((d) => d.selisih !== 0);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="td font-medium text-slate-600">{r.nomor}</td>
                      <td className="td">{new Date(r.tanggal).toLocaleDateString("id-ID")}</td>
                      <td className="td text-right">{r.detail.length}</td>
                      <td className="td text-xs text-slate-500">
                        {berselisih.length === 0
                          ? "Tidak ada selisih"
                          : berselisih.map((d) => `${d.barang.nama} (${d.selisih > 0 ? "+" : ""}${d.selisih})`).join(", ")}
                      </td>
                      <td className="td text-right">
                        <SelisihNilai value={Number(r.totalNilaiSelisih)} />
                      </td>
                      <td className="td">{r.user?.name ?? "-"}</td>
                      {canManage && (
                        <td className="td">
                          <button
                            onClick={() => handleBatalkan(r)}
                            className="icon-btn hover:bg-red-50 hover:text-red-600"
                            title="Batalkan stock opname"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Buat Stock Opname" widthClass="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tanggal Opname</label>
              <input type="date" required className="input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
            <div>
              <label className="label">Catatan (opsional)</label>
              <input className="input" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: opname rutin akhir bulan" />
            </div>
          </div>

          <div>
            <label className="label">Cari Barang</label>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode atau nama barang..." />
          </div>

          <p className="text-xs text-slate-400">
            <ClipboardCheck className="mr-1 inline h-3.5 w-3.5" />
            Isi kolom "Stok Fisik" hanya untuk barang yang benar-benar dihitung. Barang yang dikosongkan tidak akan tersimpan/berubah stoknya.
          </p>

          {loadingBarang ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-100">
              <table className="w-full min-w-max text-sm">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    <th className="th">Barang</th>
                    <th className="th text-right">Stok Sistem</th>
                    <th className="th text-right">Stok Fisik</th>
                    <th className="th text-right">Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBarang.map((b) => {
                    const val = stokFisikMap[b.id] ?? "";
                    const selisih = val.trim() === "" ? null : Number(val) - b.stok;
                    return (
                      <tr key={b.id}>
                        <td className="td">
                          {b.nama} <span className="text-xs text-slate-400">({b.kode})</span>
                        </td>
                        <td className="td text-right text-slate-500">
                          {b.stok} {b.satuan}
                        </td>
                        <td className="td text-right">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            className="input w-24 text-right"
                            value={val}
                            onChange={(e) => setStokFisikMap({ ...stokFisikMap, [b.id]: e.target.value })}
                            placeholder={String(b.stok)}
                          />
                        </td>
                        <td
                          className={`td text-right font-medium ${
                            selisih === null ? "text-slate-300" : selisih > 0 ? "text-emerald-600" : selisih < 0 ? "text-red-600" : "text-slate-400"
                          }`}
                        >
                          {selisih === null ? "-" : selisih > 0 ? `+${selisih}` : selisih}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBarang.length === 0 && (
                    <tr>
                      <td colSpan={4} className="td text-center text-slate-400">
                        Barang tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={saving || loadingBarang} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Opname
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
