import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("retur.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);
  const id = Number(params.id);

  const retur = await prisma.retur.findFirst({ where: { id, companyId }, include: { detail: true } });
  if (!retur) return NextResponse.json({ message: "Retur tidak ditemukan" }, { status: 404 });

  // Membatalkan retur PEMBELIAN mengembalikan stok (tambah lagi) -> selalu aman.
  // Membatalkan retur PENJUALAN mengurangi lagi stok yang sempat ditambahkan ->
  // bisa gagal kalau stok itu sudah terlanjur terpakai/terjual lagi.
  if (retur.jenis === "PENJUALAN") {
    for (const d of retur.detail) {
      const barang = await prisma.barang.findUnique({ where: { id: d.barangId } });
      if (!barang || barang.stok < d.qty) {
        return NextResponse.json(
          { message: `Stok "${barang?.nama ?? d.barangId}" tidak mencukupi untuk membatalkan retur ini (sudah terpakai lagi)` },
          { status: 409 }
        );
      }
    }
  }

  const referensiJurnal = retur.jenis === "PEMBELIAN" ? "retur-pembelian" : "retur-penjualan";

  await prisma.$transaction(async (tx) => {
    for (const d of retur.detail) {
      await tx.barang.update({
        where: { id: d.barangId },
        data: { stok: { [retur.jenis === "PEMBELIAN" ? "increment" : "decrement"]: d.qty } },
      });
    }
    await tx.jurnalEntry.deleteMany({ where: { referensiTipe: referensiJurnal, referensiId: retur.id } });
    await tx.retur.delete({ where: { id: retur.id } });
  });

  return NextResponse.json({ message: "Retur dibatalkan" });
}
