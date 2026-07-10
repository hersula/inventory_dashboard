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

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("barang.view");
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q") || "";

  const data = await prisma.barang.findMany({
    where: q
      ? {
          OR: [
            { nama: { contains: q } },
            { kode: { contains: q } },
          ],
        }
      : undefined,
    include: { kategori: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("barang.manage");
  if (error) return error;

  const body = await req.json();
  const parsed = barangSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.barang.findUnique({ where: { kode: parsed.data.kode } });
  if (existing) {
    return NextResponse.json({ message: "Kode barang sudah digunakan" }, { status: 409 });
  }

  const barang = await prisma.barang.create({ data: parsed.data });
  return NextResponse.json(barang, { status: 201 });
}
