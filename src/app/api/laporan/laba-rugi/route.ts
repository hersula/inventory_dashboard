import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error, session } = await requirePermission("akuntansi.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const startParam = req.nextUrl.searchParams.get("start");
  const endParam = req.nextUrl.searchParams.get("end");

  // Default: bulan berjalan
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const start = startParam ? new Date(startParam) : defaultStart;
  const end = endParam ? new Date(`${endParam}T23:59:59`) : defaultEnd;

  const details = await prisma.jurnalDetail.findMany({
    where: {
      jurnalEntry: { companyId, tanggal: { gte: start, lte: end } },
      akun: { companyId, tipe: { in: ["PENDAPATAN", "BEBAN"] } },
    },
    include: { akun: true },
  });

  const perAkun = new Map<number, { kode: string; nama: string; tipe: string; total: number }>();

  for (const d of details) {
    const akun = d.akun;
    const existing = perAkun.get(akun.id) ?? { kode: akun.kode, nama: akun.nama, tipe: akun.tipe, total: 0 };
    const nilai =
      akun.tipe === "PENDAPATAN" ? Number(d.kredit) - Number(d.debit) : Number(d.debit) - Number(d.kredit);
    existing.total += nilai;
    perAkun.set(akun.id, existing);
  }

  const pendapatan = Array.from(perAkun.values()).filter((a) => a.tipe === "PENDAPATAN");
  const beban = Array.from(perAkun.values()).filter((a) => a.tipe === "BEBAN");

  const totalPendapatan = pendapatan.reduce((s, a) => s + a.total, 0);
  const totalBeban = beban.reduce((s, a) => s + a.total, 0);

  return NextResponse.json({
    periode: { start: start.toISOString(), end: end.toISOString() },
    pendapatan,
    beban,
    totalPendapatan,
    totalBeban,
    labaRugi: totalPendapatan - totalBeban,
  });
}
