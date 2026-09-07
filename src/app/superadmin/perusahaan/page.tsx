"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { PauseCircle, PlayCircle, PackagePlus, Loader2 } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import LiveIndicator from "@/components/LiveIndicator";
import { useAutoRefresh, notifyDataChanged } from "@/lib/useAutoRefresh";

type Company = {
  id: number;
  nama: string;
  slug: string;
  email: string | null;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  rejectedReason: string | null;
  createdAt: string;
  plan: { id: number; nama: string; harga: string; billingCycle: "MONTHLY" | "YEARLY" } | null;
  subscriptionStatus: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELED";
  subscriptionEndsAt: string | null;
  totalUser: number;
  admin: { name: string; email: string } | null;
};

type Plan = { id: number; nama: string; harga: string; billingCycle: "MONTHLY" | "YEARLY" };

const statusTone: Record<Company["status"], "green" | "amber" | "red" | "slate"> = {
  PENDING: "amber",
  ACTIVE: "green",
  REJECTED: "slate",
  SUSPENDED: "red",
};
const statusLabel: Record<Company["status"], string> = {
  PENDING: "Menunggu",
  ACTIVE: "Aktif",
  REJECTED: "Ditolak",
  SUSPENDED: "Ditangguhkan",
};

export default function PerusahaanPage() {
  const [items, setItems] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filter, setFilter] = useState<"" | Company["status"]>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [search, setSearch] = useState("");

  const [planTarget, setPlanTarget] = useState<Company | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [endsAt, setEndsAt] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [companiesRes, plansRes] = await Promise.all([
        fetch(`/api/superadmin/companies${filter ? `?status=${filter}` : ""}`),
        fetch("/api/superadmin/plans"),
      ]);
      if (companiesRes.ok) setItems(await companiesRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useAutoRefresh(loadData, 15000);

  async function toggleSuspend(c: Company) {
    const action = c.status === "ACTIVE" ? "suspend" : "activate";
    if (!confirm(`${action === "suspend" ? "Tangguhkan" : "Aktifkan kembali"} perusahaan "${c.nama}"?`)) return;
    setBusyId(c.id);
    const res = await fetch(`/api/superadmin/companies/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "Gagal mengubah status perusahaan.");
      return;
    }
    notifyDataChanged();
    loadData();
  }

  function openPlan(c: Company) {
    setPlanTarget(c);
    setSelectedPlan(c.plan ? String(c.plan.id) : "");
    setEndsAt(c.subscriptionEndsAt ? c.subscriptionEndsAt.slice(0, 10) : "");
    setError("");
  }

  async function handleAssignPlan() {
    if (!planTarget) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/superadmin/companies/${planTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "assignPlan",
        planId: selectedPlan ? Number(selectedPlan) : null,
        subscriptionEndsAt: endsAt ? new Date(endsAt).toISOString() : null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal mengatur paket.");
      return;
    }
    setPlanTarget(null);
    notifyDataChanged();
    loadData();
  }

  const filtered = useMemo(
    () =>
      items.filter(
        (c) => !search || c.nama.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())
      ),
    [items, search]
  );

  const columns: Column<Company>[] = useMemo(
    () => [
      {
        header: "Perusahaan",
        render: (c) => (
          <div>
            <p className="font-medium text-slate-800">{c.nama}</p>
            <p className="text-xs text-slate-400">
              {c.admin?.email ?? c.email ?? "-"} · {c.totalUser} user
            </p>
          </div>
        ),
      },
      { header: "Status", render: (c) => <Badge tone={statusTone[c.status]}>{statusLabel[c.status]}</Badge> },
      {
        header: "Paket",
        render: (c) =>
          c.plan ? (
            <div>
              <p className="text-slate-700">{c.plan.nama}</p>
              <p className="text-xs text-slate-400">
                Rp {Number(c.plan.harga).toLocaleString("id-ID")}/{c.plan.billingCycle === "MONTHLY" ? "bln" : "thn"}
              </p>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Belum ada paket</span>
          ),
      },
      {
        header: "Berlaku Sampai",
        render: (c) => (c.subscriptionEndsAt ? new Date(c.subscriptionEndsAt).toLocaleDateString("id-ID") : "-"),
      },
      { header: "Terdaftar", render: (c) => new Date(c.createdAt).toLocaleDateString("id-ID") },
      {
        header: "Aksi",
        render: (c) => (
          <div className="flex items-center gap-1">
            {(c.status === "ACTIVE" || c.status === "SUSPENDED") && (
              <button
                onClick={() => toggleSuspend(c)}
                disabled={busyId === c.id}
                className="icon-btn"
                title={c.status === "ACTIVE" ? "Tangguhkan" : "Aktifkan kembali"}
              >
                {c.status === "ACTIVE" ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              </button>
            )}
            {c.status === "ACTIVE" && (
              <button onClick={() => openPlan(c)} className="icon-btn" title="Atur Paket">
                <PackagePlus className="h-4 w-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [busyId]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama/slug perusahaan..."
        emptyMessage="Tidak ada perusahaan."
        toolbarRight={
          <select className="input" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Ditangguhkan</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        }
      />

      <Modal open={!!planTarget} onClose={() => setPlanTarget(null)} title={`Atur Paket — ${planTarget?.nama ?? ""}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Paket Langganan</label>
            <select className="input" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
              <option value="">Tanpa paket (masa percobaan)</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} — Rp {Number(p.harga).toLocaleString("id-ID")}/
                  {p.billingCycle === "MONTHLY" ? "bulan" : "tahun"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Berlaku Sampai (opsional)</label>
            <input type="date" className="input" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setPlanTarget(null)} className="btn-secondary">
              Batal
            </button>
            <button onClick={handleAssignPlan} disabled={saving} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
