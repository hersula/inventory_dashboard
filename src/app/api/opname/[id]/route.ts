import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("opname.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);
  const id = Number(params.id);

  const opname = await prisma.stokOpname.findFirst({ where: { id, companyId }, include: { detail: true } });
  if (!opname) return NextResponse.json({ message: "Stok opname tidak ditemukan" }, { status: 404 });

  // Membatalkan selisih LEBIH (stok sempat ditambah) mengurangi stok lagi ->
  // bisa gagal kalau stok itu sudah terlanjur terpakai/terjual lagi. Selisih
  // KURANG (stok sempat dikurangi) selalu aman dibatalkan (menambah stok lagi).
  for (const d of opname.detail) {
    if (d.selisih <= 0) continue;
    const barang = await prisma.barang.findUnique({ where: { id: d.barangId } });
    if (!barang || barang.stok < d.selisih) {
      return NextResponse.json(
        { message: `Stok "${barang?.nama ?? d.barangId}" tidak mencukupi untuk membatalkan opname ini (sudah terpakai lagi)` },
        { status: 409 }
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const d of opname.detail) {
      if (d.selisih === 0) continue;
      await tx.barang.update({ where: { id: d.barangId }, data: { stok: { decrement: d.selisih } } });
    }
    await tx.jurnalEntry.deleteMany({ where: { referensiTipe: "stok-opname", referensiId: opname.id } });
    await tx.stokOpname.delete({ where: { id: opname.id } });
  });

  return NextResponse.json({ message: "Stok opname dibatalkan" });
}
