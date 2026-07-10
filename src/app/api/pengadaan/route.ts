import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/apiAuth";
import { z } from "zod";

const itemSchema = z.object({
  barangId: z.number(),
  qty: z.number().int().positive(),
  hargaSatuan: z.number().nonnegative(),
});

const pengadaanSchema = z.object({
  tanggal: z.string().optional(),
  supplierId: z.number().nullable().optional(),
  catatan: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, "Minimal 1 item barang"),
});

async function generateNomor() {
  const now = new Date();
  const prefix = `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.pengadaan.count({
    where: { nomor: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("pengadaan.view");
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q") || "";

  const data = await prisma.pengadaan.findMany({
    where: q ? { nomor: { contains: q } } : undefined,
    include: {
      supplier: true,
      user: { select: { name: true } },
      detail: { include: { barang: true } },
    },
    orderBy: { tanggal: "desc" },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("pengadaan.manage");
  if (error) return error;

  const body = await req.json();
  const parsed = pengadaanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const { items, supplierId, catatan, tanggal } = parsed.data;
  const total = items.reduce((sum, item) => sum + item.qty * item.hargaSatuan, 0);
  const nomor = await generateNomor();

  const result = await prisma.$transaction(async (tx) => {
    const pengadaan = await tx.pengadaan.create({
      data: {
        nomor,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        supplierId: supplierId ?? null,
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
        data: { stok: { increment: item.qty } },
      });
    }

    return pengadaan;
  });

  return NextResponse.json(result, { status: 201 });
}
