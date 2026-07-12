"use client";

import { useEffect, useMemo, useState, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, Loader2, XCircle, Eye, Building2 } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import LiveIndicator from "@/components/LiveIndicator";
import { can } from "@/lib/rbac";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type Barang = { id: number; kode: string; nama: string; hargaBeli: string | number; stok: number };
type Supplier = { id: number; nama: string };
type Item = { id: number; barang: Barang; qty: number; hargaSatuan: string | number; subtotal: string | number };
type Pengadaan = {
  id: number;
  nomor: string;
  tanggal: string;
  supplier: Supplier | null;
  user: { name: string };
  subtotal: string | number;
  diskonPersen: string | number;
  diskonNominal: string | number;
  ppn: string | number;
  total: string | number;
  catatan: string | null;
  detail: Item[];
};

type Row = { barangId: string; qty: string; hargaSatuan: string };
const emptyRow: Row = { barangId: "", qty: "1", hargaSatuan: "" };
const emptySupplierForm = { nama: "", alamat: "", telepon: "", email: "" };
const rupiah = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;
const NEW_SUPPLIER = "__new__";
const PPN_RATE = 0.11;

export default function PengadaanPage() {
  const { data: session } = useSession();
  const canManage = can(session?.user?.role, "pengadaan.manage");

  const [items, setItems] = useState<Pengadaan[]>([]);
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState<Pengadaan | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [supplierId, setSupplierId] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [catatan, setCatatan] = useState("");
  const [diskonPersen, setDiskonPersen] = useState("0");
  const [pakaiPpn, setPakaiPpn] = useState(true);
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);

  // Quick-add supplier langsung dari form transaksi.
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [supplierError, setSupplierError] = useState("");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/pengadaan${search ? `?q=${encodeURIComponent(search)}` : ""}`);
      setItems(await res.json());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
  }, [loadData]);

  // Auto-refresh transaksi: polling berkala, saat tab aktif kembali, dan
  // instan saat ada input baru (mis. transaksi dibuat dari HP lain).
  useAutoRefresh(loadData, 15000);

  const loadRefData = useCallback(() => {
    fetch("/api/barang")
      .then((r) => r.json())
      .then(setBarangList);
    fetch("/api/supplier")
      .then((r) => r.json())
      .then(setSuppliers);
  }, []);

  useEffect(() => {
    loadRefData();
  }, [loadRefData]);

  // Daftar barang & stok ikut auto-refresh agar saat membuka form transaksi,
  // stok yang tampil selalu yang terbaru (tidak perlu reload halaman).
  useAutoRefresh(loadRefData, 15000);

  function openCreate() {
    setEditingId(null);
    setSupplierId("");
    setTanggal(new Date().toISOString().slice(0, 10));
    setCatatan("");
    setDiskonPersen("0");
    setPakaiPpn(true);
    setRows([{ ...emptyRow }]);
    setError("");
    setModalOpen(true);
  }

  function openEdit(p: Pengadaan) {
    setEditingId(p.id);
    setSupplierId(p.supplier ? String(p.supplier.id) : "");
    setTanggal(new Date(p.tanggal).toISOString().slice(0, 10));
    setCatatan(p.catatan ?? "");
    setDiskonPersen(String(p.diskonPersen ?? 0));
    setPakaiPpn(Number(p.ppn) > 0);
    setRows([
      ...p.detail.map((d) => ({
        barangId: String(d.barang.id),
        qty: String(d.qty),
        hargaSatuan: String(d.hargaSatuan),
      })),
      { ...emptyRow },
    ]);
    setError("");
    setModalOpen(true);
  }

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      if (patch.barangId) {
        const b = barangList.find((x) => x.id === Number(patch.barangId));
        if (b) next[idx].hargaSatuan = String(b.hargaBeli);
        // Auto-tambah baris kosong baru begitu baris TERAKHIR baru saja
        // dipilih barangnya, supaya user bisa langsung memilih barang
        // kedua/ketiga tanpa perlu ingat klik "+ Tambah baris" secara manual.
        if (idx === next.length - 1) {
          next.push({ ...emptyRow });
        }
      }
      return next;
    });
  }

  function handleSupplierSelect(value: string) {
    if (value === NEW_SUPPLIER) {
      setSupplierForm(emptySupplierForm);
      setSupplierError("");
      setSupplierModalOpen(true);
      return;
    }
    setSupplierId(value);
  }

  async function handleSupplierSubmit(e: FormEvent) {
    e.preventDefault();
    setSavingSupplier(true);
    setSupplierError("");

    const res = await fetch("/api/supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplierForm),
    });
    const data = await res.json().catch(() => ({}));
    setSavingSupplier(false);

    if (!res.ok) {
      setSupplierError(data.message || "Gagal menambahkan supplier.");
      return;
    }

    // Supplier baru langsung masuk daftar & otomatis terpilih di form transaksi.
    setSuppliers((prev) => [...prev, data]);
    setSupplierId(String(data.id));
    setSupplierModalOpen(false);
  }

  // Ringkasan subtotal -> diskon -> DPP -> PPN 11% -> total, dihitung ulang
  // otomatis setiap kali item atau persen diskon berubah.
  const ringkasan = useMemo(() => {
    const subtotal = rows.reduce((sum, r) => sum + (Number(r.qty) || 0) * (Number(r.hargaSatuan) || 0), 0);
    const persen = Math.min(100, Math.max(0, Number(diskonPersen) || 0));
    const diskonNominal = Math.round((subtotal * persen) / 100);
    const dpp = subtotal - diskonNominal;
    const ppn = pakaiPpn ? Math.round(dpp * PPN_RATE) : 0;
    const total = dpp + ppn;
    return { subtotal, diskonNominal, dpp, ppn, total };
  }, [rows, diskonPersen, pakaiPpn]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const validRows = rows.filter((r) => r.barangId && Number(r.qty) > 0);
    if (validRows.length === 0) {
      setError("Tambahkan minimal 1 item barang.");
      return;
    }

    setSaving(true);
    const res = await fetch(editingId ? `/api/pengadaan/${editingId}` : "/api/pengadaan", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId: supplierId ? Number(supplierId) : null,
        tanggal,
        catatan: catatan || null,
        diskonPersen: Math.min(100, Math.max(0, Number(diskonPersen) || 0)),
        pakaiPpn,
        items: validRows.map((r) => ({
          barangId: Number(r.barangId),
          qty: Number(r.qty),
          hargaSatuan: Number(r.hargaSatuan) || 0,
        })),
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menyimpan transaksi.");
      return;
    }

    setModalOpen(false);
    notifyDataChanged();
    loadData();
    loadRefData();
  }

  async function handleCancel(p: Pengadaan) {
    if (!confirm(`Batalkan transaksi ${p.nomor}? Stok barang akan dikurangi kembali.`)) return;
    const res = await fetch(`/api/pengadaan/${p.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal membatalkan transaksi.");
      return;
    }
    notifyDataChanged();
    loadData();
    loadRefData();
  }

  const columns: Column<Pengadaan>[] = useMemo(
    () => [
      { header: "No. Transaksi", render: (p) => <span className="font-medium text-slate-700">{p.nomor}</span> },
      { header: "Tanggal", render: (p) => new Date(p.tanggal).toLocaleDateString("id-ID") },
      { header: "Supplier", render: (p) => p.supplier?.nama ?? "-" },
      { header: "Jumlah Item", render: (p) => `${p.detail.length} item` },
      { header: "Total", render: (p) => <span className="font-medium">{rupiah(Number(p.total))}</span> },
      { header: "Petugas", render: (p) => p.user?.name ?? "-" },
      {
        header: "Aksi",
        render: (p) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDetailOpen(p)}
              className="icon-btn"
              title="Lihat detail"
            >
              <Eye className="h-4 w-4" />
            </button>
            {canManage && (
              <button
                onClick={() => openEdit(p)}
                className="icon-btn"
                title="Edit transaksi"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canManage && (
              <button
                onClick={() => handleCancel(p)}
                className="icon-btn hover:bg-red-50 hover:text-red-600"
                title="Batalkan"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari no. transaksi..."
        emptyMessage="Belum ada transaksi pengadaan."
        toolbarRight={
          canManage && (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              Transaksi Baru
            </button>
          )
        }
      />

      {/* Form transaksi baru */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Transaksi Pengadaan" : "Transaksi Pengadaan Baru"} widthClass="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Supplier</label>
              <select className="input" value={supplierId} onChange={(e) => handleSupplierSelect(e.target.value)}>
                <option value="">Tanpa supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
                <option value={NEW_SUPPLIER}>+ Tambah Supplier Baru...</option>
              </select>
            </div>
            <div>
              <label className="label">Tanggal</label>
              <input type="date" required className="input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">
                Daftar Barang{" "}
                <span className="font-normal text-slate-400">
                  ({rows.filter((r) => r.barangId).length} barang dipilih)
                </span>
              </label>
              <button
                type="button"
                onClick={() => setRows([...rows, { ...emptyRow }])}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-brand-300 px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah baris
              </button>
            </div>
            <p className="mb-2 -mt-1 text-xs text-slate-400">
              Baris baru otomatis muncul begitu Anda memilih barang — tekan tombol ini hanya jika ingin menambah baris kosong tanpa memilih barang dulu.
            </p>

            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div key={idx} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center">
                  <select
                    className="input sm:flex-1"
                    value={row.barangId}
                    onChange={(e) => updateRow(idx, { barangId: e.target.value })}
                  >
                    <option value="">Pilih barang...</option>
                    {barangList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.kode} - {b.nama}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="Qty"
                    className="input sm:w-24"
                    value={row.qty}
                    onChange={(e) => updateRow(idx, { qty: e.target.value })}
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="Harga satuan"
                    className="input sm:w-36"
                    value={row.hargaSatuan}
                    onChange={(e) => updateRow(idx, { hargaSatuan: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                    disabled={rows.length === 1}
                    className="self-end rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 sm:self-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Catatan (opsional)</label>
            <textarea className="input" rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Diskon (%)</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                className="input"
                value={diskonPersen}
                onChange={(e) => setDiskonPersen(e.target.value)}
              />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={pakaiPpn}
                  onChange={(e) => setPakaiPpn(e.target.checked)}
                />
                Kenakan PPN 11%
              </label>
            </div>
          </div>

          <div className="space-y-1.5 rounded-lg bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>{rupiah(ringkasan.subtotal)}</span>
            </div>
            {ringkasan.diskonNominal > 0 && (
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Diskon ({diskonPersen || 0}%)</span>
                <span>- {rupiah(ringkasan.diskonNominal)}</span>
              </div>
            )}
            {pakaiPpn && (
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>PPN 11%</span>
                <span>+ {rupiah(ringkasan.ppn)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-sm font-semibold text-slate-800">
              <span>Total Pengadaan</span>
              <span>{rupiah(ringkasan.total)}</span>
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Simpan Perubahan" : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick-add Supplier */}
      <Modal open={supplierModalOpen} onClose={() => setSupplierModalOpen(false)} title="Tambah Supplier Baru">
        <form onSubmit={handleSupplierSubmit} className="space-y-4">
          <div>
            <label className="label">Nama Supplier</label>
            <input
              required
              autoFocus
              className="input"
              value={supplierForm.nama}
              onChange={(e) => setSupplierForm({ ...supplierForm, nama: e.target.value })}
              placeholder="Contoh: PT Sumber Makmur"
            />
          </div>
          <div>
            <label className="label">Alamat (opsional)</label>
            <textarea
              className="input"
              rows={2}
              value={supplierForm.alamat}
              onChange={(e) => setSupplierForm({ ...supplierForm, alamat: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Telepon (opsional)</label>
              <input
                className="input"
                inputMode="tel"
                value={supplierForm.telepon}
                onChange={(e) => setSupplierForm({ ...supplierForm, telepon: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email (opsional)</label>
              <input
                type="email"
                className="input"
                value={supplierForm.email}
                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
              />
            </div>
          </div>

          {supplierError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <Building2 className="h-4 w-4 shrink-0" />
              {supplierError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setSupplierModalOpen(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={savingSupplier} className="btn-primary">
              {savingSupplier && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail transaksi */}
      <Modal
        open={!!detailOpen}
        onClose={() => setDetailOpen(null)}
        title={`Detail Transaksi ${detailOpen?.nomor ?? ""}`}
        widthClass="max-w-lg"
      >
        {detailOpen && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Tanggal</p>
                <p className="font-medium text-slate-700">{new Date(detailOpen.tanggal).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <p className="text-slate-400">Supplier</p>
                <p className="font-medium text-slate-700">{detailOpen.supplier?.nama ?? "-"}</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
              {detailOpen.detail.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{d.barang.nama}</p>
                    <p className="text-xs text-slate-400">
                      {d.qty} x {rupiah(Number(d.hargaSatuan))}
                    </p>
                  </div>
                  <p className="font-medium text-slate-700">{rupiah(Number(d.subtotal))}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 rounded-lg bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{rupiah(Number(detailOpen.subtotal))}</span>
              </div>
              {Number(detailOpen.diskonNominal) > 0 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Diskon ({Number(detailOpen.diskonPersen)}%)</span>
                  <span>- {rupiah(Number(detailOpen.diskonNominal))}</span>
                </div>
              )}
              {Number(detailOpen.ppn) > 0 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>PPN 11%</span>
                  <span>+ {rupiah(Number(detailOpen.ppn))}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-sm font-semibold text-slate-800">
                <span>Total</span>
                <span>{rupiah(Number(detailOpen.total))}</span>
              </div>
            </div>
            {detailOpen.catatan && (
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{detailOpen.catatan}</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
