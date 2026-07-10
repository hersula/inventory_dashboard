import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/apiAuth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("penjualan.view");
  if (error) return error;

  const data = await prisma.penjualan.findUnique({
    where: { id: Number(params.id) },
    include: { pelanggan: true, user: { select: { name: true } }, detail: { include: { barang: true } } },
  });
  if (!data) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("penjualan.manage");
  if (error) return error;

  const penjualan = await prisma.penjualan.findUnique({
    where: { id: Number(params.id) },
    include: { detail: true },
  });
  if (!penjualan) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    for (const item of penjualan.detail) {
      await tx.barang.update({
        where: { id: item.barangId },
        data: { stok: { increment: item.qty } },
      });
    }
    await tx.penjualan.delete({ where: { id: penjualan.id } });
  });

  return NextResponse.json({ message: "Transaksi penjualan dibatalkan" });
}
