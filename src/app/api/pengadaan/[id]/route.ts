import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { jurnalPengadaan, hapusJurnalReferensi } from "@/lib/akuntansi";
import { z } from "zod";

const itemSchema = z.object({
  barangId: z.number(),
  qty: z.number().int().positive(),
  hargaSatuan: z.number().nonnegative(),
});

const updateSchema = z.object({
  tanggal: z.string().optional(),
  supplierId: z.number().nullable().optional(),
  catatan: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1, "Minimal 1 item barang"),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("pengadaan.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const data = await prisma.pengadaan.findFirst({
    where: { id: Number(params.id), companyId },
    include: { supplier: true, user: { select: { name: true } }, detail: { include: { barang: true } } },
  });
  if (!data) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("pengadaan.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const id = Number(params.id);
  const existing = await prisma.pengadaan.findFirst({ where: { id, companyId }, include: { detail: true } });
  if (!existing) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }
  const { items, supplierId, catatan, tanggal } = parsed.data;

  // Pengadaan menambah stok saat dibuat. Saat diedit, kita hitung selisih
  // (delta) qty per barang antara data lama vs data baru, lalu terapkan
  // selisihnya saja ke stok — bukan reset total, supaya perubahan stok yang
  // sudah terjadi di transaksi lain (mis. sudah terjual) tetap konsisten.
  const oldMap = new Map<number, number>();
  for (const d of existing.detail) oldMap.set(d.barangId, (oldMap.get(d.barangId) ?? 0) + d.qty);

  const newMap = new Map<number, number>();
  for (const it of items) newMap.set(it.barangId, (newMap.get(it.barangId) ?? 0) + it.qty);

  const affectedIds = Array.from(new Set([...oldMap.keys(), ...newMap.keys()]));
  const barangList = await prisma.barang.findMany({ where: { id: { in: affectedIds }, companyId } });

  const deltas: { barangId: number; delta: number }[] = [];
  for (const bid of affectedIds) {
    const barang = barangList.find((b) => b.id === bid);
    if (!barang) {
      return NextResponse.json({ message: "Salah satu barang tidak ditemukan" }, { status: 400 });
    }
    const delta = (newMap.get(bid) ?? 0) - (oldMap.get(bid) ?? 0);
    const resultingStok = barang.stok + delta;
    if (resultingStok < 0) {
      return NextResponse.json(
        {
          message: `Perubahan qty membuat stok "${barang.nama}" menjadi minus (sisa saat ini ${barang.stok}). Barang tersebut mungkin sudah terjual, jadi qty pengadaan tidak bisa dikurangi sebanyak itu.`,
        },
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

    await tx.pengadaanDetail.deleteMany({ where: { pengadaanId: id } });

    const updated = await tx.pengadaan.update({
      where: { id },
      data: {
        tanggal: tanggal ? new Date(tanggal) : existing.tanggal,
        supplierId: supplierId ?? null,
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
      include: { supplier: true, user: { select: { name: true } }, detail: { include: { barang: true } } },
    });

    // Jurnal lama untuk transaksi ini dihapus & diposting ulang dengan total
    // terbaru — lebih sederhana & selalu akurat dibanding menghitung selisihnya.
    try {
      await hapusJurnalReferensi(tx, "pengadaan", id);
      await jurnalPengadaan(tx, {
        companyId,
        pengadaanId: id,
        nomor: updated.nomor,
        tanggal: updated.tanggal,
        total,
        userId: Number(session!.user.id),
      });
    } catch (err) {
      console.error("Gagal menyesuaikan jurnal otomatis untuk pengadaan", updated.nomor, err);
    }

    return updated;
  });

  return NextResponse.json(result);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("pengadaan.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const pengadaan = await prisma.pengadaan.findFirst({
    where: { id: Number(params.id), companyId },
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
    await hapusJurnalReferensi(tx, "pengadaan", pengadaan.id);
    await tx.pengadaan.delete({ where: { id: pengadaan.id } });
  });

  return NextResponse.json({ message: "Transaksi pengadaan dibatalkan" });
}
