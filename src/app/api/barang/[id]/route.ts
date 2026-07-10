import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/apiAuth";
import { z } from "zod";

const barangSchema = z.object({
  kode: z.string().min(1),
  nama: z.string().min(1),
  kategoriId: z.number().nullable().optional(),
  satuan: z.string().min(1),
  hargaBeli: z.number().nonnegative(),
  hargaJual: z.number().nonnegative(),
  stok: z.number().int().nonnegative().optional(),
  stokMinimum: z.number().int().nonnegative().optional(),
  deskripsi: z.string().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("barang.view");
  if (error) return error;

  const barang = await prisma.barang.findUnique({
    where: { id: Number(params.id) },
    include: { kategori: true },
  });
  if (!barang) return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 });
  return NextResponse.json(barang);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("barang.manage");
  if (error) return error;

  const body = await req.json();
  const parsed = barangSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const dup = await prisma.barang.findFirst({
    where: { kode: parsed.data.kode, NOT: { id: Number(params.id) } },
  });
  if (dup) return NextResponse.json({ message: "Kode barang sudah digunakan" }, { status: 409 });

  const barang = await prisma.barang.update({
    where: { id: Number(params.id) },
    data: parsed.data,
  });
  return NextResponse.json(barang);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("barang.manage");
  if (error) return error;

  try {
    await prisma.barang.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "Barang dihapus" });
  } catch {
    return NextResponse.json(
      { message: "Barang tidak dapat dihapus karena sudah dipakai dalam transaksi" },
      { status: 409 }
    );
  }
}
