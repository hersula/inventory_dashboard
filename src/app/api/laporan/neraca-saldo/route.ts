import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function GET() {
  const { error, session } = await requirePermission("akuntansi.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const akunList = await prisma.akun.findMany({ where: { companyId }, orderBy: { kode: "asc" } });

  const agregat = await prisma.jurnalDetail.groupBy({
    by: ["akunId"],
    where: { akun: { companyId } },
    _sum: { debit: true, kredit: true },
  });

  const rows = akunList.map((akun) => {
    const a = agregat.find((x) => x.akunId === akun.id);
    const totalDebit = Number(a?._sum.debit ?? 0);
    const totalKredit = Number(a?._sum.kredit ?? 0);
    const saldo = akun.saldoNormal === "DEBIT" ? totalDebit - totalKredit : totalKredit - totalDebit;

    return {
      akunId: akun.id,
      kode: akun.kode,
      nama: akun.nama,
      tipe: akun.tipe,
      saldoNormal: akun.saldoNormal,
      totalDebit,
      totalKredit,
      saldo,
    };
  });

  const grandTotalDebit = rows.reduce((s, r) => s + r.totalDebit, 0);
  const grandTotalKredit = rows.reduce((s, r) => s + r.totalKredit, 0);

  return NextResponse.json({
    rows,
    grandTotalDebit,
    grandTotalKredit,
    balance: Math.round(grandTotalDebit * 100) === Math.round(grandTotalKredit * 100),
  });
}
