import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error, session } = await requirePermission("akuntansi.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const tipe = req.nextUrl.searchParams.get("tipe") === "PIUTANG" ? "PIUTANG" : "HUTANG";

  if (tipe === "HUTANG") {
    const list = await prisma.pengadaan.findMany({
      where: { companyId, metodeBayar: { in: ["KREDIT", "TEMPO"] } },
      include: { supplier: true },
      orderBy: { tanggal: "desc" },
    });
    const bayarAgg = await prisma.pembayaran.groupBy({
      by: ["referensiId"],
      where: { companyId, referensiTipe: "pengadaan", referensiId: { in: list.map((l) => l.id) } },
      _sum: { jumlah: true },
    });
    const bayarMap = new Map(bayarAgg.map((b) => [b.referensiId, Number(b._sum.jumlah ?? 0)]));

    const enriched = list
      .map((p) => {
        const totalDibayar = bayarMap.get(p.id) ?? 0;
        return {
          id: p.id,
          nomor: p.nomor,
          tanggal: p.tanggal,
          pihak: p.supplier?.nama ?? "-",
          metodeBayar: p.metodeBayar,
          total: Number(p.total),
          totalDibayar,
          sisa: Number(p.total) - totalDibayar,
        };
      })
      .filter((p) => p.sisa > 0.5);

    return NextResponse.json(enriched);
  }

  const list = await prisma.penjualan.findMany({
    where: { companyId, metodeBayar: { in: ["KREDIT", "TEMPO"] } },
    include: { pelanggan: true },
    orderBy: { tanggal: "desc" },
  });
  const bayarAgg = await prisma.pembayaran.groupBy({
    by: ["referensiId"],
    where: { companyId, referensiTipe: "penjualan", referensiId: { in: list.map((l) => l.id) } },
    _sum: { jumlah: true },
  });
  const bayarMap = new Map(bayarAgg.map((b) => [b.referensiId, Number(b._sum.jumlah ?? 0)]));

  const enriched = list
    .map((p) => {
      const totalDibayar = bayarMap.get(p.id) ?? 0;
      return {
        id: p.id,
        nomor: p.nomor,
        tanggal: p.tanggal,
        pihak: p.pelanggan?.nama ?? "Umum",
        metodeBayar: p.metodeBayar,
        total: Number(p.total),
        totalDibayar,
        sisa: Number(p.total) - totalDibayar,
      };
    })
    .filter((p) => p.sisa > 0.5);

  return NextResponse.json(enriched);
}
