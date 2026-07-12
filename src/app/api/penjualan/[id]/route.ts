import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { jurnalPenjualan, hapusJurnalReferensi, PPN_RATE } from "@/lib/akuntansi";
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
  diskonPersen: z.number().min(0).max(100).optional(),
  pakaiPpn: z.boolean().optional(),
  items: z.array(itemSchema).min(1, "Minimal 1 item barang"),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("penjualan.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const data = await prisma.penjualan.findFirst({
    where: { id: Number(params.id), companyId },
    include: { pelanggan: true, user: { select: { name: true } }, detail: { include: { barang: true } } },
  });
  if (!data) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("penjualan.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const id = Number(params.id);
  const existing = await prisma.penjualan.findFirst({ where: { id, companyId }, include: { detail: true } });
  if (!existing) return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }
  const { items, pelangganId, catatan, tanggal, diskonPersen = 0, pakaiPpn = true } = parsed.data;

  // Penjualan mengurangi stok saat dibuat. Saat diedit, hitung selisih qty
  // lama vs baru per barang: jika qty baru lebih kecil, sebagian stok
  // dikembalikan; jika lebih besar, stok dikurangi lagi (dengan validasi
  // stok tersedia agar tidak minus).
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

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.hargaSatuan, 0);
  const diskonNominal = Math.round((subtotal * diskonPersen) / 100);
  const dpp = subtotal - diskonNominal;
  const ppn = pakaiPpn ? Math.round(dpp * PPN_RATE) : 0;
  const total = dpp + ppn;
  // HPP dihitung ulang dari harga beli barang saat ini (barangList sudah
  // memuat semua barang yang terlibat, termasuk baris baru). Tidak
  // dipengaruhi diskon/PPN sisi jual.
  const hpp = items.reduce((sum, item) => {
    const barang = barangList.find((b) => b.id === item.barangId);
    return sum + item.qty * Number(barang?.hargaBeli ?? 0);
  }, 0);

  const result = await prisma.$transaction(async (tx) => {
    for (const d of deltas) {
      await tx.barang.update({ where: { id: d.barangId }, data: { stok: { increment: d.delta } } });
    }

    await tx.penjualanDetail.deleteMany({ where: { penjualanId: id } });

    const updated = await tx.penjualan.update({
      where: { id },
      data: {
        tanggal: tanggal ? new Date(tanggal) : existing.tanggal,
        pelangganId: pelangganId ?? null,
        catatan,
        subtotal,
        diskonPersen,
        diskonNominal,
        ppn,
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

    try {
      await hapusJurnalReferensi(tx, "penjualan", id);
      await jurnalPenjualan(tx, {
        companyId,
        penjualanId: id,
        nomor: updated.nomor,
        tanggal: updated.tanggal,
        dpp,
        ppn,
        total,
        hpp,
        userId: Number(session!.user.id),
      });
    } catch (err) {
      console.error("Gagal menyesuaikan jurnal otomatis untuk penjualan", updated.nomor, err);
    }

    return updated;
  });

  return NextResponse.json(result);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requirePermission("penjualan.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const penjualan = await prisma.penjualan.findFirst({
    where: { id: Number(params.id), companyId },
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
    await hapusJurnalReferensi(tx, "penjualan", penjualan.id);
    await tx.penjualan.delete({ where: { id: penjualan.id } });
  });

  return NextResponse.json({ message: "Transaksi penjualan dibatalkan" });
}
