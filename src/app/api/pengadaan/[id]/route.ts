import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/apiAuth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("pengadaan.view");
  if (error) return error;

  const data = await prisma.pengadaan.findUnique({
    where: { id: Number(params.id) },
    include: { supplier: true, user: { select: { name: true } }, detail: { include: { barang: true } } },
  });
  if (!data) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("pengadaan.manage");
  if (error) return error;

  const pengadaan = await prisma.pengadaan.findUnique({
    where: { id: Number(params.id) },
    include: { detail: true },
  });
  if (!pengadaan) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    for (const item of pengadaan.detail) {
      await tx.barang.update({
        where: { id: item.barangId },
        data: { stok: { decrement: item.qty } },
      });
    }
    await tx.pengadaan.delete({ where: { id: pengadaan.id } });
  });

  return NextResponse.json({ message: "Transaksi pengadaan dibatalkan" });
}
