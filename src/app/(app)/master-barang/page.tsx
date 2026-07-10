"use client";

import { useEffect, useMemo, useState, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, Loader2, PackageSearch } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import LiveIndicator from "@/components/LiveIndicator";
import { can } from "@/lib/rbac";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type Kategori = { id: number; nama: string };
type Barang = {
  id: number;
  kode: string;
  nama: string;
  kategoriId: number | null;
  kategori: Kategori | null;
  satuan: string;
  hargaBeli: string | number;
  hargaJual: string | number;
  stok: number;
  stokMinimum: number;
  deskripsi: string | null;
};

const emptyForm = {
  id: 0,
  kode: "",
  nama: "",
  kategoriId: "" as string | number,
  satuan: "pcs",
  hargaBeli: "",
  hargaJual: "",
  stok: "",
  stokMinimum: "5",
  deskripsi: "",
};

const rupiah = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;

export default function MasterBarangPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const canManage = can(role, "barang.manage");

  const [items, setItems] = useState<Barang[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [barangRes, kategoriRes] = await Promise.all([
        fetch(`/api/barang${search ? `?q=${encodeURIComponent(search)}` : ""}`),
        fetch("/api/kategori"),
      ]);
      setItems(await barangRes.json());
      setKategoris(await kategoriRes.json());
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

  // Auto-refresh: polling berkala, saat tab aktif kembali, dan instan saat
  // ada input baru (tambah/edit/hapus barang, atau stok berubah dari modul lain).
  useAutoRefresh(loadData, 15000);

  function openCreate() {
    setForm(emptyForm);
    setEditing(false);
    setError("");
    setModalOpen(true);
  }

  function openEdit(b: Barang) {
    setForm({
      id: b.id,
      kode: b.kode,
      nama: b.nama,
      kategoriId: b.kategoriId ?? "",
      satuan: b.satuan,
      hargaBeli: String(b.hargaBeli),
      hargaJual: String(b.hargaJual),
      stok: String(b.stok),
      stokMinimum: String(b.stokMinimum),
      deskripsi: b.deskripsi ?? "",
    });
    setEditing(true);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      kode: form.kode,
      nama: form.nama,
      kategoriId: form.kategoriId ? Number(form.kategoriId) : null,
      satuan: form.satuan,
      hargaBeli: Number(form.hargaBeli) || 0,
      hargaJual: Number(form.hargaJual) || 0,
      stok: Number(form.stok) || 0,
      stokMinimum: Number(form.stokMinimum) || 0,
      deskripsi: form.deskripsi || null,
    };

    const res = await fetch(editing ? `/api/barang/${form.id}` : "/api/barang", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menyimpan data.");
      return;
    }

    setModalOpen(false);
    notifyDataChanged();
    loadData();
  }

  async function handleDelete(b: Barang) {
    if (!confirm(`Hapus barang "${b.nama}"?`)) return;
    const res = await fetch(`/api/barang/${b.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal menghapus barang.");
      return;
    }
    notifyDataChanged();
    loadData();
  }

  const columns: Column<Barang>[] = useMemo(
    () => [
      { header: "Kode", render: (b) => <span className="font-medium text-slate-600">{b.kode}</span> },
      {
        header: "Nama Barang",
        render: (b) => (
          <div>
            <p className="font-medium text-slate-800">{b.nama}</p>
            <p className="text-xs text-slate-400">{b.kategori?.nama ?? "Tanpa kategori"}</p>
          </div>
        ),
      },
      { header: "Satuan", render: (b) => b.satuan },
      { header: "Harga Beli", render: (b) => rupiah(Number(b.hargaBeli)) },
      { header: "Harga Jual", render: (b) => rupiah(Number(b.hargaJual)) },
      {
        header: "Stok",
        render: (b) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{b.stok}</span>
            {b.stok === 0 ? (
              <Badge tone="red">Habis</Badge>
            ) : b.stok <= b.stokMinimum ? (
              <Badge tone="amber">Menipis</Badge>
            ) : (
              <Badge tone="green">Aman</Badge>
            )}
          </div>
        ),
      },
      ...(canManage
        ? [
            {
              header: "Aksi",
              render: (b: Barang) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(b)}
                    className="icon-btn"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b)}
                    className="icon-btn hover:bg-red-50 hover:text-red-600"
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            } as Column<Barang>,
          ]
        : []),
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
        searchPlaceholder="Cari kode atau nama barang..."
        emptyMessage="Belum ada barang. Tambahkan barang pertama Anda."
        toolbarRight={
          canManage && (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              Tambah Barang
            </button>
          )
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Barang" : "Tambah Barang"}
        widthClass="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Kode Barang</label>
              <input
                required
                className="input"
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value })}
                placeholder="BRG-001"
              />
            </div>
            <div>
              <label className="label">Kategori</label>
              <select
                className="input"
                value={form.kategoriId}
                onChange={(e) => setForm({ ...form, kategoriId: e.target.value })}
              >
                <option value="">Tanpa kategori</option>
                {kategoris.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Nama Barang</label>
            <input
              required
              className="input"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Mouse Wireless"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Satuan</label>
              <input
                required
                className="input"
                value={form.satuan}
                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                placeholder="pcs / box / kg"
              />
            </div>
            <div>
              <label className="label">Stok Awal</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                required
                className="input"
                value={form.stok}
                onChange={(e) => setForm({ ...form, stok: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Stok Minimum</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                required
                className="input"
                value={form.stokMinimum}
                onChange={(e) => setForm({ ...form, stokMinimum: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Harga Beli</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                required
                className="input"
                value={form.hargaBeli}
                onChange={(e) => setForm({ ...form, hargaBeli: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Harga Jual</label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                required
                className="input"
                value={form.hargaJual}
                onChange={(e) => setForm({ ...form, hargaJual: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Deskripsi (opsional)</label>
            <textarea
              className="input"
              rows={2}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <PackageSearch className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-slate-100 bg-white px-5 py-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
