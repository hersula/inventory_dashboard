"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#3d63f5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function CategoryChart({ data }: { data: { nama: string; jumlah: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="jumlah" nameKey="nama" innerRadius={60} outerRadius={95} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eef1f6", fontSize: 13 }} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "#64748b" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
