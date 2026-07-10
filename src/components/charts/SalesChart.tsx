"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type SalesPoint = { bulan: string; penjualan: number; pengadaan: number };

const formatShort = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
  return String(v);
};

export default function SalesChart({ data }: { data: SalesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3d63f5" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#3d63f5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPengadaan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
        <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatShort} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value: number) => `Rp ${value.toLocaleString("id-ID")}`}
          contentStyle={{ borderRadius: 12, border: "1px solid #eef1f6", fontSize: 13 }}
        />
        <Area type="monotone" dataKey="penjualan" name="Penjualan" stroke="#3d63f5" fill="url(#colorPenjualan)" strokeWidth={2} />
        <Area type="monotone" dataKey="pengadaan" name="Pengadaan" stroke="#f59e0b" fill="url(#colorPengadaan)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
