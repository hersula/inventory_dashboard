"use client";

import { useEffect, useMemo, useState, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, Loader2, BookOpen, ShieldAlert } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import LiveIndicator from "@/components/LiveIndicator";
import { can } from "@/lib/rbac";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type Tipe = "ASET" | "KEWAJIBAN" | "MODAL" | "PENDAPATAN" | "BEBAN";
type SaldoNormal = "DEBIT" | "KREDIT";

type Akun = {
  id: number;
  kode: string;
  nama: string;
  tipe: Tipe;
  saldoNormal: SaldoNormal;
  isActive: boolean;
};

const emptyForm = { id: 0, kode: "", nama: "", tipe: "ASET" as Tipe, saldoNormal: "DEBIT" as SaldoNormal, isActive: true };

const TIPE_LABEL: Record<Tipe, string> = {
  ASET: "Aset",
  KEWAJIBAN: "Kewajiban",
  MODAL: "Modal",
  PENDAPATAN: "Pendapatan",
  BEBAN: "Beban",
};

const tipeTone: Record<Tipe, "brand" | "amber" | "green" | "slate" | "red"> = {
  ASET: "brand",
  KEWAJIBAN: "amber",
  MODAL: "slate",
  PENDAPATAN: "green",
  BEBAN: "red",
};

// Default saldo normal per tipe akun — memudahkan pengisian form.
const DEFAULT_SALDO_NORMAL: Record<Tipe, SaldoNormal> = {
  ASET: "DEBIT",
  KEWAJIBAN: "KREDIT",
  MODAL: "KREDIT",
  PENDAPATAN: "KREDIT",
  BEBAN: "DEBIT",
};

export default function AkuntansiPage() {
  const { data: session, status } = useSession();
  const canView = can(session?.user?.role, "akuntansi.view");
  const canManage = can(session?.user?.role, "akuntansi.manage");

  const [items, setItems] = useState<Akun[]>([]);
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
      const res = await fetch(`/api/akun${search ? `?q=${encodeURIComponent(search)}` : ""}`);
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

  useAutoRefresh(loadData, 15000);

  function openCreate() {
    setForm(emptyForm);
    setEditing(false);
    setError("");
    setModalOpen(true);
  }

  function openEdit(a: Akun) {
    setForm({ id: a.id, kode: a.kode, nama: a.nama, tipe: a.tipe, saldoNormal: a.saldoNormal, isActive: a.isActive });
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
      tipe: form.tipe,
      saldoNormal: form.saldoNormal,
      ...(editing ? { isActive: form.isActive } : {}),
    };

    const res = await fetch(editing ? `/api/akun/${form.id}` : "/api/akun", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menyimpan akun.");
      return;
    }

    setModalOpen(false);
    notifyDataChanged();
    loadData();
  }

  async function handleDelete(a: Akun) {
    if (!confirm(`Hapus akun "${a.kode} - ${a.nama}"?`)) return;
    const res = await fetch(`/api/akun/${a.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal menghapus akun.");
      return;
    }
    notifyDataChanged();
    loadData();
  }

  const columns: Column<Akun>[] = useMemo(
    () => [
      { header: "Kode", render: (a) => <span className="font-medium text-slate-600">{a.kode}</span> },
      { header: "Nama Akun", render: (a) => a.nama },
      { header: "Tipe", render: (a) => <Badge tone={tipeTone[a.tipe]}>{TIPE_LABEL[a.tipe]}</Badge> },
      { header: "Saldo Normal", render: (a) => (a.saldoNormal === "DEBIT" ? "Debit" : "Kredit") },
      {
        header: "Status",
        render: (a) => (a.isActive ? <Badge tone="green">Aktif</Badge> : <Badge tone="slate">Nonaktif</Badge>),
      },
      ...(canManage
        ? [
            {
              header: "Aksi",
              render: (a: Akun) => (
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(a)} className="icon-btn" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(a)} className="icon-btn hover:bg-red-50 hover:text-red-600" title="Hapus">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            } as Column<Akun>,
          ]
        : []),
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
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <p className="text-sm text-slate-600">
          Chart of Akun (COA) adalah daftar akun keuangan yang dipakai sistem untuk mencatat semua transaksi.
          Transaksi <strong>Pengadaan</strong> dan <strong>Penjualan</strong> otomatis membuat jurnal memakai akun{" "}
          <em>Kas</em>, <em>Persediaan</em>, <em>Pendapatan Penjualan</em>, dan <em>HPP</em> di bawah ini — jangan
          hapus akun tersebut, cukup nonaktifkan jika benar-benar tidak dipakai lagi.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kode atau nama akun..."
        emptyMessage="Belum ada akun. Jalankan seed atau tambahkan akun pertama."
        toolbarRight={
          canManage && (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              Tambah Akun
            </button>
          )
        }
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Akun" : "Tambah Akun"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Kode Akun</label>
              <input
                required
                className="input"
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value })}
                placeholder="1101"
              />
            </div>
            <div>
              <label className="label">Tipe Akun</label>
              <select
                className="input"
                value={form.tipe}
                onChange={(e) => {
                  const tipe = e.target.value as Tipe;
                  setForm({ ...form, tipe, saldoNormal: DEFAULT_SALDO_NORMAL[tipe] });
                }}
              >
                {(Object.keys(TIPE_LABEL) as Tipe[]).map((t) => (
                  <option key={t} value={t}>
                    {TIPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Nama Akun</label>
            <input
              required
              className="input"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Kas"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Saldo Normal</label>
              <select
                className="input"
                value={form.saldoNormal}
                onChange={(e) => setForm({ ...form, saldoNormal: e.target.value as SaldoNormal })}
              >
                <option value="DEBIT">Debit</option>
                <option value="KREDIT">Kredit</option>
              </select>
            </div>
            {editing && (
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={form.isActive ? "1" : "0"}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "1" })}
                >
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </select>
              </div>
            )}
          </div>

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

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
        </>
      )}
    </div>
  );
}
