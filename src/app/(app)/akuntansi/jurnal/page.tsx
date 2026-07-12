"use client";

import { useEffect, useMemo, useState, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Plus, Trash2, Loader2, Eye, Lock, ScrollText, ShieldAlert } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import LiveIndicator from "@/components/LiveIndicator";
import { can } from "@/lib/rbac";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type Akun = { id: number; kode: string; nama: string };
type DetailLine = { id: number; akun: Akun; debit: string | number; kredit: string | number; keterangan: string | null };
type Jurnal = {
  id: number;
  nomor: string;
  tanggal: string;
  keterangan: string | null;
  referensiTipe: string;
  user: { name: string };
  detail: DetailLine[];
};

type Row = { akunId: string; debit: string; kredit: string; keterangan: string };
const emptyRow: Row = { akunId: "", debit: "", kredit: "", keterangan: "" };
const rupiah = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;

const REF_LABEL: Record<string, string> = {
  manual: "Manual",
  pengadaan: "Otomatis · Pengadaan",
  penjualan: "Otomatis · Penjualan",
};
const refTone: Record<string, "slate" | "brand" | "green"> = {
  manual: "slate",
  pengadaan: "brand",
  penjualan: "green",
};

export default function JurnalPage() {
  const { data: session, status } = useSession();
  const canView = can(session?.user?.role, "akuntansi.view");
  const canManage = can(session?.user?.role, "akuntansi.manage");

  const [items, setItems] = useState<Jurnal[]>([]);
  const [akunList, setAkunList] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<Jurnal | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [keterangan, setKeterangan] = useState("");
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }, { ...emptyRow }]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (startDate) params.set("start", startDate);
      if (endDate) params.set("end", endDate);
      const res = await fetch(`/api/jurnal?${params.toString()}`);
      setItems(await res.json());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, startDate, endDate]);

  useEffect(() => {
    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
  }, [loadData]);

  useAutoRefresh(loadData, 15000);

  useEffect(() => {
    fetch("/api/akun")
      .then((r) => r.json())
      .then(setAkunList);
  }, []);

  function openCreate() {
    setTanggal(new Date().toISOString().slice(0, 10));
    setKeterangan("");
    setRows([{ ...emptyRow }, { ...emptyRow }]);
    setError("");
    setModalOpen(true);
  }

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  const totalDebit = rows.reduce((s, r) => s + (Number(r.debit) || 0), 0);
  const totalKredit = rows.reduce((s, r) => s + (Number(r.kredit) || 0), 0);
  const isBalance = Math.round(totalDebit * 100) === Math.round(totalKredit * 100) && totalDebit > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const validRows = rows.filter((r) => r.akunId && (Number(r.debit) > 0 || Number(r.kredit) > 0));
    if (validRows.length < 2) {
      setError("Jurnal minimal terdiri dari 2 baris (sisi debit dan kredit).");
      return;
    }
    if (!isBalance) {
      setError(`Jurnal belum balance. Total debit ${rupiah(totalDebit)} ≠ total kredit ${rupiah(totalKredit)}.`);
      return;
    }

    setSaving(true);
    const res = await fetch("/api/jurnal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tanggal,
        keterangan,
        lines: validRows.map((r) => ({
          akunId: Number(r.akunId),
          debit: Number(r.debit) || 0,
          kredit: Number(r.kredit) || 0,
          keterangan: r.keterangan || null,
        })),
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menyimpan jurnal.");
      return;
    }

    setModalOpen(false);
    notifyDataChanged();
    loadData();
  }

  async function handleDelete(j: Jurnal) {
    if (!confirm(`Hapus jurnal ${j.nomor}?`)) return;
    const res = await fetch(`/api/jurnal/${j.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal menghapus jurnal.");
      return;
    }
    notifyDataChanged();
    loadData();
  }

  const columns: Column<Jurnal>[] = useMemo(
    () => [
      { header: "No. Jurnal", render: (j) => <span className="font-medium text-slate-700">{j.nomor}</span> },
      { header: "Tanggal", render: (j) => new Date(j.tanggal).toLocaleDateString("id-ID") },
      { header: "Keterangan", render: (j) => j.keterangan ?? "-" },
      { header: "Sumber", render: (j) => <Badge tone={refTone[j.referensiTipe] ?? "slate"}>{REF_LABEL[j.referensiTipe] ?? j.referensiTipe}</Badge> },
      {
        header: "Total",
        render: (j) => rupiah(j.detail.reduce((s, d) => s + Number(d.debit), 0)),
      },
      { header: "Dibuat oleh", render: (j) => j.user?.name ?? "-" },
      {
        header: "Aksi",
        render: (j) => (
          <div className="flex items-center gap-1">
            <button onClick={() => setDetailOpen(j)} className="icon-btn" title="Lihat detail">
              <Eye className="h-4 w-4" />
            </button>
            {canManage &&
              (j.referensiTipe === "manual" ? (
                <button onClick={() => handleDelete(j)} className="icon-btn hover:bg-red-50 hover:text-red-600" title="Hapus">
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="icon-btn cursor-not-allowed opacity-40" title="Jurnal otomatis — edit lewat transaksi sumbernya">
                  <Lock className="h-4 w-4" />
                </span>
              ))}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage]
  );

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
      <div className="flex justify-end">
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      <div className="card flex items-start gap-3 bg-brand-50/50">
        <ScrollText className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <p className="text-sm text-slate-600">
          Jurnal berlabel <Badge tone="brand">Otomatis</Badge> dibuat sistem dari transaksi Pengadaan/Penjualan dan
          tidak bisa dihapus langsung di sini — ubah lewat transaksi sumbernya. Gunakan tombol{" "}
          <strong>Jurnal Manual</strong> untuk mencatat transaksi keuangan lain (mis. bayar gaji, sewa, dsb).
        </p>
      </div>

      <div className="card flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Dari Tanggal</label>
          <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Sampai Tanggal</label>
          <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="btn-secondary"
          >
            Reset Filter
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari no. jurnal atau keterangan..."
        emptyMessage="Belum ada jurnal."
        toolbarRight={
          canManage && (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              Jurnal Manual
            </button>
          )
        }
      />

      {/* Form jurnal manual */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Input Jurnal Manual" widthClass="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tanggal</label>
              <input type="date" required className="input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
            <div>
              <label className="label">Keterangan</label>
              <input
                required
                className="input"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Pembayaran gaji karyawan Juli"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">Baris Jurnal (Debit = Kredit)</label>
              <button
                type="button"
                onClick={() => setRows([...rows, { ...emptyRow }])}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-brand-300 px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah baris
              </button>
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div key={idx} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center">
                  <select
                    className="input sm:flex-1"
                    value={row.akunId}
                    onChange={(e) => updateRow(idx, { akunId: e.target.value })}
                  >
                    <option value="">Pilih akun...</option>
                    {akunList.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.kode} - {a.nama}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="Debit"
                    className="input sm:w-32"
                    value={row.debit}
                    onChange={(e) => updateRow(idx, { debit: e.target.value, kredit: e.target.value ? "" : row.kredit })}
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="Kredit"
                    className="input sm:w-32"
                    value={row.kredit}
                    onChange={(e) => updateRow(idx, { kredit: e.target.value, debit: e.target.value ? "" : row.debit })}
                  />
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                    disabled={rows.length <= 2}
                    className="self-end rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 sm:self-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`flex items-center justify-between rounded-lg px-4 py-3 ${
              isBalance ? "bg-emerald-50" : "bg-amber-50"
            }`}
          >
            <span className="text-sm font-medium text-slate-600">Total Debit / Kredit</span>
            <span className={`text-sm font-semibold ${isBalance ? "text-emerald-700" : "text-amber-700"}`}>
              {rupiah(totalDebit)} / {rupiah(totalKredit)} {isBalance ? "✓ Balance" : "— belum balance"}
            </span>
          </div>

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Jurnal
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail jurnal */}
      <Modal open={!!detailOpen} onClose={() => setDetailOpen(null)} title={`Detail Jurnal ${detailOpen?.nomor ?? ""}`} widthClass="max-w-lg">
        {detailOpen && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Tanggal</p>
                <p className="font-medium text-slate-700">{new Date(detailOpen.tanggal).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <p className="text-slate-400">Sumber</p>
                <Badge tone={refTone[detailOpen.referensiTipe] ?? "slate"}>
                  {REF_LABEL[detailOpen.referensiTipe] ?? detailOpen.referensiTipe}
                </Badge>
              </div>
            </div>
            {detailOpen.keterangan && <p className="text-sm text-slate-600">{detailOpen.keterangan}</p>}
            <div className="overflow-hidden rounded-lg border border-slate-100">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Akun</th>
                    <th className="th text-right">Debit</th>
                    <th className="th text-right">Kredit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailOpen.detail.map((d) => (
                    <tr key={d.id}>
                      <td className="td">
                        <p className="font-medium text-slate-700">{d.akun.nama}</p>
                        <p className="text-xs text-slate-400">{d.akun.kode}</p>
                      </td>
                      <td className="td text-right">{Number(d.debit) > 0 ? rupiah(Number(d.debit)) : "-"}</td>
                      <td className="td text-right">{Number(d.kredit) > 0 ? rupiah(Number(d.kredit)) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
        </>
      )}
    </div>
  );
}
