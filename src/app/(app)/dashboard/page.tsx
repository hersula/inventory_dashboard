"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Package,
  Boxes,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import LiveIndicator from "@/components/LiveIndicator";
import SalesChart, { SalesPoint } from "@/components/charts/SalesChart";
import CategoryChart from "@/components/charts/CategoryChart";
import TopBarangChart from "@/components/charts/TopBarangChart";
import { useAutoRefresh } from "@/lib/useAutoRefresh";

type StockItem = {
  id: number;
  kode: string;
  nama: string;
  stok: number;
  stokMinimum: number;
};

type DashboardStats = {
  totalBarang: number;
  totalStok: number;
  totalNilaiStok: number;
  lowStockCount: number;
  lowStockItems: StockItem[];
  penjualanBulanIni: { total: number; jumlahTransaksi: number };
  pengadaanBulanIni: { total: number; jumlahTransaksi: number };
  chartMonthly: SalesPoint[];
  kategoriChart: { nama: string; jumlah: number }[];
  topBarang: { nama: string; terjual: number }[];
};

const rupiah = (v: number) =>
  `Rp ${Math.round(v).toLocaleString("id-ID")}`;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh otomatis: polling berkala + saat tab aktif kembali + saat ada
  // input baru dari modul lain (mis. transaksi penjualan mengubah stok).
  useAutoRefresh(loadData, 15000);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-28 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <LiveIndicator lastUpdated={lastUpdated} refreshing={refreshing} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Jenis Barang"
          value={stats.totalBarang.toLocaleString("id-ID")}
          icon={Package}
          tone="brand"
          hint={`${stats.totalStok.toLocaleString("id-ID")} unit di gudang`}
        />
        <StatCard
          label="Nilai Stok Gudang"
          value={rupiah(stats.totalNilaiStok)}
          icon={Wallet}
          tone="green"
          hint="Berdasarkan harga beli"
        />
        <StatCard
          label="Penjualan Bulan Ini"
          value={rupiah(stats.penjualanBulanIni.total)}
          icon={TrendingUp}
          tone="brand"
          hint={`${stats.penjualanBulanIni.jumlahTransaksi} transaksi`}
        />
        <StatCard
          label="Pengadaan Bulan Ini"
          value={rupiah(stats.pengadaanBulanIni.total)}
          icon={TrendingDown}
          tone="amber"
          hint={`${stats.pengadaanBulanIni.jumlahTransaksi} transaksi`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Tren Penjualan &amp; Pengadaan (6 Bulan Terakhir)
            </h3>
          </div>
          <SalesChart data={stats.chartMonthly} />
        </div>
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Komposisi Kategori Barang
          </h3>
          {stats.kategoriChart.length > 0 ? (
            <CategoryChart data={stats.kategoriChart} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">
              Belum ada data kategori.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-700">
              Barang Stok Menipis
            </h3>
          </div>
          <p className="mb-4 text-xs text-slate-400">
            Barang dengan stok di bawah atau sama dengan stok minimum.
          </p>
          {stats.lowStockItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Semua stok barang dalam kondisi aman.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Kode</th>
                    <th className="th">Nama Barang</th>
                    <th className="th">Stok</th>
                    <th className="th">Min. Stok</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="td font-medium text-slate-600">{item.kode}</td>
                      <td className="td">{item.nama}</td>
                      <td className="td">{item.stok}</td>
                      <td className="td">{item.stokMinimum}</td>
                      <td className="td">
                        {item.stok === 0 ? (
                          <Badge tone="red">Habis</Badge>
                        ) : (
                          <Badge tone="amber">Menipis</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="mb-1 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-700">
              Barang Terlaris
            </h3>
          </div>
          <p className="mb-4 text-xs text-slate-400">
            5 barang dengan penjualan terbanyak (6 bulan terakhir).
          </p>
          {stats.topBarang.length > 0 ? (
            <TopBarangChart data={stats.topBarang} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">
              Belum ada transaksi penjualan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
