import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function GET() {
  const { error, session } = await requirePermission("dashboard.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalBarang,
    totalStokAgg,
    penjualanBulanIni,
    pengadaanBulanIni,
    kategoriBarang,
    penjualanDetailAll,
    penjualan6Bulan,
    pengadaan6Bulan,
  ] = await Promise.all([
    prisma.barang.count({ where: { companyId } }),
    prisma.barang.aggregate({ where: { companyId }, _sum: { stok: true } }),
    prisma.penjualan.aggregate({
      where: { companyId, tanggal: { gte: startOfMonth } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.pengadaan.aggregate({
      where: { companyId, tanggal: { gte: startOfMonth } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.kategori.findMany({ where: { companyId }, include: { _count: { select: { barang: true } } } }),
    prisma.penjualanDetail.findMany({
      where: { penjualan: { companyId, tanggal: { gte: sixMonthsAgo } } },
      include: { barang: true },
    }),
    prisma.penjualan.findMany({
      where: { companyId, tanggal: { gte: sixMonthsAgo } },
      select: { tanggal: true, total: true },
    }),
    prisma.pengadaan.findMany({
      where: { companyId, tanggal: { gte: sixMonthsAgo } },
      select: { tanggal: true, total: true },
    }),
  ]);

  // Fallback for low-stock (Prisma doesn't support comparing two columns directly in all versions)
  const allBarang = await prisma.barang.findMany({ where: { companyId } });
  const lowStock = allBarang
    .filter((b) => b.stok <= b.stokMinimum)
    .sort((a, b) => a.stok - b.stok)
    .slice(0, 8);

  const bulanLabel = (d: Date) =>
    d.toLocaleDateString("id-ID", { month: "short" });

  const monthlyMap: Record<string, { bulan: string; penjualan: number; pengadaan: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyMap[key] = { bulan: bulanLabel(d), penjualan: 0, pengadaan: 0 };
  }
  for (const p of penjualan6Bulan) {
    const d = new Date(p.tanggal);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap[key]) monthlyMap[key].penjualan += Number(p.total);
  }
  for (const p of pengadaan6Bulan) {
    const d = new Date(p.tanggal);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap[key]) monthlyMap[key].pengadaan += Number(p.total);
  }
  const chartMonthly = Object.values(monthlyMap);

  const kategoriChart = kategoriBarang.map((k) => ({ nama: k.nama, jumlah: k._count.barang }));

  const topBarangMap: Record<string, number> = {};
  for (const d of penjualanDetailAll) {
    topBarangMap[d.barang.nama] = (topBarangMap[d.barang.nama] || 0) + d.qty;
  }
  const topBarang = Object.entries(topBarangMap)
    .map(([nama, terjual]) => ({ nama, terjual }))
    .sort((a, b) => b.terjual - a.terjual)
    .slice(0, 5);

  const totalNilaiStok = allBarang.reduce((sum, b) => sum + b.stok * Number(b.hargaBeli), 0);

  return NextResponse.json({
    totalBarang,
    totalStok: totalStokAgg._sum.stok ?? 0,
    totalNilaiStok,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock,
    penjualanBulanIni: {
      total: Number(penjualanBulanIni._sum.total ?? 0),
      jumlahTransaksi: penjualanBulanIni._count,
    },
    pengadaanBulanIni: {
      total: Number(pengadaanBulanIni._sum.total ?? 0),
      jumlahTransaksi: pengadaanBulanIni._count,
    },
    chartMonthly,
    kategoriChart,
    topBarang,
  });
}
