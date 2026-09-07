"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Check, X, Loader2, Building2 } from "lucide-react";
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
  telepon: string | null;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  createdAt: string;
  admin: { name: string; email: string } | null;
};

type Plan = { id: number; nama: string; harga: string; billingCycle: "MONTHLY" | "YEARLY" };

export default function PendaftaranPage() {
  const [items, setItems] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [approveTarget, setApproveTarget] = useState<Company | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [rejectTarget, setRejectTarget] = useState<Company | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [companiesRes, plansRes] = await Promise.all([
        fetch("/api/superadmin/companies?status=PENDING"),
        fetch("/api/superadmin/plans"),
      ]);
      if (companiesRes.ok) setItems(await companiesRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
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

  function openApprove(c: Company) {
    setApproveTarget(c);
    setSelectedPlan("");
    setError("");
  }

  function openReject(c: Company) {
    setRejectTarget(c);
    setReason("");
    setError("");
  }

  async function handleApprove() {
    if (!approveTarget) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/superadmin/companies/${approveTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", planId: selectedPlan ? Number(selectedPlan) : undefined }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menyetujui pendaftaran.");
      return;
    }
    setApproveTarget(null);
    notifyDataChanged();
    loadData();
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/superadmin/companies/${rejectTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Gagal menolak pendaftaran.");
      return;
    }
    setRejectTarget(null);
    notifyDataChanged();
    loadData();
  }

  const columns: Column<Company>[] = useMemo(
    () => [
      {
        header: "Perusahaan",
        render: (c) => (
          <div>
            <p className="font-medium text-slate-800">{c.nama}</p>
            <p className="text-xs text-slate-400">{c.slug}</p>
          </div>
        ),
      },
      {
        header: "Admin Pendaftar",
        render: (c) => (
          <div>
            <p className="text-slate-700">{c.admin?.name ?? "-"}</p>
            <p className="text-xs text-slate-400">{c.admin?.email ?? c.email ?? "-"}</p>
          </div>
        ),
      },
      { header: "Tanggal Daftar", render: (c) => new Date(c.createdAt).toLocaleString("id-ID") },
      {
        header: "Aksi",
        render: (c) => (
          <div className="flex items-center gap-2">
            <button onClick={() => openApprove(c)} className="btn-primary py-1.5 text-xs">
              <Check className="h-3.5 w-3.5" />
              Setujui
            </button>
            <button
              onClick={() => openReject(c)}
              className="btn-secondary py-1.5 text-xs hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
              Tolak
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Building2 className="h-4 w-4" />
          Perusahaan berstatus <Badge tone="amber">Menunggu Persetujuan</Badge>
        </div>
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="Tidak ada pendaftaran yang menunggu persetujuan saat ini."
      />

      <Modal open={!!approveTarget} onClose={() => setApproveTarget(null)} title="Setujui Pendaftaran">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Setujui pendaftaran <strong>{approveTarget?.nama}</strong>? Admin pendaftar akan langsung bisa login
            setelah ini.
          </p>
          <div>
            <label className="label">Paket Langganan (opsional, bisa diatur belakangan)</label>
            <select className="input" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
              <option value="">Belum pilih paket (masa percobaan)</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} — Rp {Number(p.harga).toLocaleString("id-ID")}/
                  {p.billingCycle === "MONTHLY" ? "bulan" : "tahun"}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setApproveTarget(null)} className="btn-secondary">
              Batal
            </button>
            <button onClick={handleApprove} disabled={saving} className="btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Setujui
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Tolak Pendaftaran">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Tolak pendaftaran <strong>{rejectTarget?.nama}</strong>? Berikan alasan penolakan.
          </p>
          <div>
            <label className="label">Alasan Penolakan</label>
            <textarea
              className="input"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Data perusahaan tidak valid / duplikat pendaftaran"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setRejectTarget(null)} className="btn-secondary">
              Batal
            </button>
            <button onClick={handleReject} disabled={saving || reason.trim().length < 3} className="btn-danger">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Tolak Pendaftaran
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
