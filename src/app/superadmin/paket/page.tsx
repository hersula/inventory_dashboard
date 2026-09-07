"use client";

import { useEffect, useState, useCallback, useMemo, FormEvent } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type Plan = {
  id: number;
  nama: string;
  slug: string;
  harga: string;
  billingCycle: "MONTHLY" | "YEARLY";
  maxUser: number | null;
  maxBarang: number | null;
  deskripsi: string | null;
  isActive: boolean;
  totalPerusahaan: number;
};

const emptyForm = {
  id: 0,
  nama: "",
  harga: "0",
  billingCycle: "MONTHLY" as "MONTHLY" | "YEARLY",
  maxUser: "",
  maxBarang: "",
  deskripsi: "",
  isActive: true,
};

export default function PaketPage() {
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    const res = await fetch("/api/superadmin/plans");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useAutoRefresh(loadData, 15000);

  function openCreate() {
    setForm(emptyForm);
    setEditing(false);
    setError("");
    setModalOpen(true);
  }

  function openEdit(p: Plan) {
    setForm({
      id: p.id,
      nama: p.nama,
      harga: p.harga,
      billingCycle: p.billingCycle,
      maxUser: p.maxUser ? String(p.maxUser) : "",
      maxBarang: p.maxBarang ? String(p.maxBarang) : "",
      deskripsi: p.deskripsi ?? "",
      isActive: p.isActive,
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
      nama: form.nama,
      harga: Number(form.harga),
      billingCycle: form.billingCycle,
      maxUser: form.maxUser ? Number(form.maxUser) : null,
      maxBarang: form.maxBarang ? Number(form.maxBarang) : null,
      deskripsi: form.deskripsi || undefined,
      isActive: form.isActive,
    };

    const res = await fetch(editing ? `/api/superadmin/plans/${form.id}` : "/api/superadmin/plans", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menyimpan paket.");
      return;
    }

    setModalOpen(false);
    notifyDataChanged();
    loadData();
  }

  async function handleDelete(p: Plan) {
    if (!confirm(`Hapus paket "${p.nama}"?`)) return;
    const res = await fetch(`/api/superadmin/plans/${p.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal menghapus paket.");
      return;
    }
    notifyDataChanged();
    loadData();
  }

  const columns: Column<Plan>[] = useMemo(
    () => [
      {
        header: "Paket",
        render: (p) => (
          <div>
            <p className="font-medium text-slate-800">{p.nama}</p>
            {p.deskripsi && <p className="max-w-xs truncate text-xs text-slate-400">{p.deskripsi}</p>}
          </div>
        ),
      },
      {
        header: "Harga",
        render: (p) => (
          <span>
            Rp {Number(p.harga).toLocaleString("id-ID")}
            <span className="text-xs text-slate-400">/{p.billingCycle === "MONTHLY" ? "bulan" : "tahun"}</span>
          </span>
        ),
      },
      {
        header: "Batasan",
        render: (p) => (
          <span className="text-xs text-slate-500">
            {p.maxUser ? `${p.maxUser} user` : "User tanpa batas"} · {p.maxBarang ? `${p.maxBarang} barang` : "Barang tanpa batas"}
          </span>
        ),
      },
      { header: "Dipakai", render: (p) => `${p.totalPerusahaan} perusahaan` },
      { header: "Status", render: (p) => (p.isActive ? <Badge tone="green">Aktif</Badge> : <Badge tone="slate">Nonaktif</Badge>) },
      {
        header: "Aksi",
        render: (p) => (
          <div className="flex items-center gap-1">
            <button onClick={() => openEdit(p)} className="icon-btn" title="Edit">
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(p)}
              className="icon-btn hover:bg-red-50 hover:text-red-600"
              title="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="Belum ada paket langganan."
        toolbarRight={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" />
            Tambah Paket
          </button>
        }
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Paket" : "Tambah Paket"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nama Paket</label>
            <input
              required
              className="input"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Free, Basic, Pro"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Harga (Rp)</label>
              <input
                required
                type="number"
                min={0}
                inputMode="numeric"
                className="input"
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Siklus Tagihan</label>
              <select
                className="input"
                value={form.billingCycle}
                onChange={(e) => setForm({ ...form, billingCycle: e.target.value as "MONTHLY" | "YEARLY" })}
              >
                <option value="MONTHLY">Bulanan</option>
                <option value="YEARLY">Tahunan</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Maks. User (kosongkan = tanpa batas)</label>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                className="input"
                value={form.maxUser}
                onChange={(e) => setForm({ ...form, maxUser: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Maks. Jenis Barang (kosongkan = tanpa batas)</label>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                className="input"
                value={form.maxBarang}
                onChange={(e) => setForm({ ...form, maxBarang: e.target.value })}
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
          {editing && (
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.isActive ? "1" : "0"}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "1" })}
              >
                <option value="1">Aktif (bisa dipilih untuk perusahaan)</option>
                <option value="0">Nonaktif (disembunyikan, tidak dihapus)</option>
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

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
