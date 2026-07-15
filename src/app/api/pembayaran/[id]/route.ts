import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("akuntansi.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);
  const id = Number(params.id);

  const pembayaran = await prisma.pembayaran.findFirst({ where: { id, companyId } });
  if (!pembayaran) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

  const referensiJurnal = pembayaran.tipe === "HUTANG" ? "pembayaran-hutang" : "pembayaran-piutang";

  await prisma.$transaction(async (tx) => {
    await tx.jurnalEntry.deleteMany({ where: { referensiTipe: referensiJurnal, referensiId: pembayaran.id } });
    await tx.pembayaran.delete({ where: { id: pembayaran.id } });
  });

  return NextResponse.json({ message: "Pembayaran dibatalkan" });
}
