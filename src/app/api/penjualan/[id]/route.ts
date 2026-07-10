import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/apiAuth";
import { z } from "zod";

const itemSchema = z.object({
  barangId: z.number(),
  qty: z.number().int().positive(),
  hargaSatuan: z.number().nonnegative(),
});

const updateSchema = z.object({
  tanggal: z.string().optional(),
  pelangganId: z.number().nullable().optional(),
  catatan: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, "Minimal 1 item barang"),
});

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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("penjualan.manage");
  if (error) return error;

  const id = Number(params.id);
  const existing = await prisma.penjualan.findUnique({ where: { id }, include: { detail: true } });
  if (!existing) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }
  const { items, pelangganId, catatan, tanggal } = parsed.data;

  // Penjualan mengurangi stok saat dibuat. Saat diedit, hitung selisih qty
  // lama vs baru per barang: jika qty baru lebih kecil, sebagian stok
  // dikembalikan; jika lebih besar, stok dikurangi lagi (dengan validasi
  // stok tersedia agar tidak minus).
  const oldMap = new Map<number, number>();
  for (const d of existing.detail) oldMap.set(d.barangId, (oldMap.get(d.barangId) ?? 0) + d.qty);

  const newMap = new Map<number, number>();
  for (const it of items) newMap.set(it.barangId, (newMap.get(it.barangId) ?? 0) + it.qty);

  const affectedIds = Array.from(new Set([...oldMap.keys(), ...newMap.keys()]));
  const barangList = await prisma.barang.findMany({ where: { id: { in: affectedIds } } });

  const deltas: { barangId: number; delta: number }[] = [];
  for (const bid of affectedIds) {
    const barang = barangList.find((b) => b.id === bid);
    if (!barang) {
      return NextResponse.json({ message: "Salah satu barang tidak ditemukan" }, { status: 400 });
    }
    // stok bertambah sebesar (qty lama - qty baru): positif jika qty berkurang (dikembalikan),
    // negatif jika qty bertambah (dikurangi lagi dari stok).
    const delta = (oldMap.get(bid) ?? 0) - (newMap.get(bid) ?? 0);
    const resultingStok = barang.stok + delta;
    if (resultingStok < 0) {
      return NextResponse.json(
        { message: `Stok "${barang.nama}" tidak mencukupi untuk qty baru (tersedia ${barang.stok + (oldMap.get(bid) ?? 0)}).` },
        { status: 409 }
      );
    }
    if (delta !== 0) deltas.push({ barangId: bid, delta });
  }

  const total = items.reduce((sum, item) => sum + item.qty * item.hargaSatuan, 0);

  const result = await prisma.$transaction(async (tx) => {
    for (const d of deltas) {
      await tx.barang.update({ where: { id: d.barangId }, data: { stok: { increment: d.delta } } });
    }

    await tx.penjualanDetail.deleteMany({ where: { penjualanId: id } });

    return tx.penjualan.update({
      where: { id },
      data: {
        tanggal: tanggal ? new Date(tanggal) : existing.tanggal,
        pelangganId: pelangganId ?? null,
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
      include: { pelanggan: true, user: { select: { name: true } }, detail: { include: { barang: true } } },
    });
  });

  return NextResponse.json(result);
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
