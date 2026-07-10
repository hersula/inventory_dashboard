import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/apiAuth";
import { z } from "zod";

const itemSchema = z.object({
  barangId: z.number(),
  qty: z.number().int().positive(),
  hargaSatuan: z.number().nonnegative(),
});

const penjualanSchema = z.object({
  tanggal: z.string().optional(),
  pelangganId: z.number().nullable().optional(),
  catatan: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, "Minimal 1 item barang"),
});

async function generateNomor() {
  const now = new Date();
  const prefix = `PJ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.penjualan.count({
    where: { nomor: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("penjualan.view");
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q") || "";

  const data = await prisma.penjualan.findMany({
    where: q ? { nomor: { contains: q } } : undefined,
    include: {
      pelanggan: true,
      user: { select: { name: true } },
      detail: { include: { barang: true } },
    },
    orderBy: { tanggal: "desc" },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("penjualan.manage");
  if (error) return error;

  const body = await req.json();
  const parsed = penjualanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const { items, pelangganId, catatan, tanggal } = parsed.data;

  const barangIds = items.map((i) => i.barangId);
  const barangList = await prisma.barang.findMany({ where: { id: { in: barangIds } } });

  for (const item of items) {
    const barang = barangList.find((b) => b.id === item.barangId);
    if (!barang) {
      return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 400 });
    }
    if (barang.stok < item.qty) {
      return NextResponse.json(
        { message: `Stok "${barang.nama}" tidak mencukupi (tersedia ${barang.stok})` },
        { status: 409 }
      );
    }
  }

  const total = items.reduce((sum, item) => sum + item.qty * item.hargaSatuan, 0);
  const nomor = await generateNomor();

  const result = await prisma.$transaction(async (tx) => {
    const penjualan = await tx.penjualan.create({
      data: {
        nomor,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        pelangganId: pelangganId ?? null,
        userId: Number(session!.user.id),
        catatan,
        total,
        detail: {
          create: items.map((item) => ({
            barangId: item.barangId,
            qty: item.qty,
            hargaSatuan: item.hargaSatuan,
            subtotal: item.qty * item.hargaSatuan,
          })),
        },
      },
      include: { detail: true },
    });

    for (const item of items) {
      await tx.barang.update({
        where: { id: item.barangId },
        data: { stok: { decrement: item.qty } },
      });
    }

    return penjualan;
  });

  return NextResponse.json(result, { status: 201 });
}
