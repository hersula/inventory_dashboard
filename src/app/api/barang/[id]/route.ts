import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
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
  const { error, session } = await requirePermission("barang.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const barang = await prisma.barang.findFirst({
    where: { id: Number(params.id), companyId },
    include: { kategori: true },
  });
  if (!barang) return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 });
  return NextResponse.json(barang);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("barang.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);
  const id = Number(params.id);

  // Pastikan barang ini milik perusahaan yang sedang login sebelum diubah.
  const owned = await prisma.barang.findFirst({ where: { id, companyId } });
  if (!owned) return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const parsed = barangSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const dup = await prisma.barang.findFirst({
    where: { kode: parsed.data.kode, companyId, NOT: { id } },
  });
  if (dup) return NextResponse.json({ message: "Kode barang sudah digunakan" }, { status: 409 });

  const barang = await prisma.barang.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(barang);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("barang.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);
  const id = Number(params.id);

  const owned = await prisma.barang.findFirst({ where: { id, companyId } });
  if (!owned) return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 });

  try {
    await prisma.barang.delete({ where: { id } });
    return NextResponse.json({ message: "Barang dihapus" });
  } catch {
    return NextResponse.json(
      { message: "Barang tidak dapat dihapus karena sudah dipakai dalam transaksi" },
      { status: 409 }
    );
  }
}
