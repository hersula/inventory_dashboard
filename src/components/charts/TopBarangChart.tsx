"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TopBarangChart({ data }: { data: { nama: string; terjual: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="nama"
          width={120}
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eef1f6", fontSize: 13 }} />
        <Bar dataKey="terjual" radius={[0, 6, 6, 0]} fill="#3d63f5" />
      </BarChart>
    </ResponsiveContainer>
  );
}
