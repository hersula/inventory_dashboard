"use client";

import { useEffect, useMemo, useState, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, Loader2, ShieldAlert } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import LiveIndicator from "@/components/LiveIndicator";
import { can, ROLE_LABEL, Role } from "@/lib/rbac";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
};

const emptyForm = {
  id: 0,
  name: "",
  email: "",
  password: "",
  role: "STAFF" as Role,
  active: true,
};

const roleTone: Record<Role, "brand" | "amber" | "slate"> = {
  ADMIN: "brand",
  MANAGER: "amber",
  STAFF: "slate",
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id;
  const allowed = can(session?.user?.role, "users.manage");

  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        setItems(await res.json());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  function openEdit(u: User) {
    setForm({ id: u.id, name: u.name, email: u.email, password: "", role: u.role, active: u.active });
    setEditing(true);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload: any = { name: form.name, email: form.email, role: form.role };
    if (editing) payload.active = form.active;
    if (!editing || form.password) payload.password = form.password;

    const res = await fetch(editing ? `/api/users/${form.id}` : "/api/users", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menyimpan data user.");
      return;
    }

    setModalOpen(false);
    notifyDataChanged();
    loadData();
  }

  async function handleDelete(u: User) {
    if (!confirm(`Hapus user "${u.name}"?`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal menghapus user.");
      return;
    }
    notifyDataChanged();
    loadData();
  }

  const columns: Column<User>[] = useMemo(
    () => [
      {
        header: "Nama",
        render: (u) => (
          <div>
            <p className="font-medium text-slate-800">{u.name}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        ),
      },
      { header: "Role", render: (u) => <Badge tone={roleTone[u.role]}>{ROLE_LABEL[u.role]}</Badge> },
      {
        header: "Status",
        render: (u) => (u.active ? <Badge tone="green">Aktif</Badge> : <Badge tone="red">Nonaktif</Badge>),
      },
      { header: "Bergabung", render: (u) => new Date(u.createdAt).toLocaleDateString("id-ID") },
      {
        header: "Aksi",
        render: (u) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEdit(u)}
              className="icon-btn"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(u)}
              disabled={String(u.id) === currentUserId}
              className="icon-btn hover:bg-red-50 hover:text-red-600"
              title="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [currentUserId]
  );

  if (status === "authenticated" && !allowed) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
        <ShieldAlert className="h-8 w-8 text-red-400" />
        <p className="font-medium text-slate-700">Akses ditolak</p>
        <p className="max-w-sm text-sm text-slate-400">
          Anda tidak memiliki izin untuk mengelola user. Hubungi Administrator jika Anda memerlukan akses ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="Belum ada user."
        toolbarRight={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" />
            Tambah User
          </button>
        }
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit User" : "Tambah User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{editing ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}</label>
            <input
              type="password"
              required={!editing}
              minLength={6}
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="ADMIN">Administrator</option>
                <option value="MANAGER">Manajer</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
            {editing && (
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={form.active ? "1" : "0"}
                  onChange={(e) => setForm({ ...form, active: e.target.value === "1" })}
                >
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <ShieldAlert className="h-4 w-4 shrink-0" />
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
