import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { jurnalPenjualan, PPN_RATE, isLunasDiMuka } from "@/lib/akuntansi";
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
  diskonPersen: z.number().min(0).max(100).optional(),
  pakaiPpn: z.boolean().optional(),
  metodeBayar: z.enum(["TUNAI", "TRANSFER", "KREDIT", "TEMPO"]).optional(),
  items: z.array(itemSchema).min(1, "Minimal 1 item barang"),
});

async function generateNomor(companyId: number) {
  const now = new Date();
  const prefix = `PJ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.penjualan.count({
    where: { companyId, nomor: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

/** Hitung subtotal, diskon, PPN, dan grand total dari daftar item + persen diskon. */
function hitungRingkasan(items: { qty: number; hargaSatuan: number }[], diskonPersen: number, pakaiPpn: boolean) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.hargaSatuan, 0);
  const diskonNominal = Math.round((subtotal * diskonPersen) / 100);
  const dpp = subtotal - diskonNominal; // Dasar Pengenaan Pajak
  const ppn = pakaiPpn ? Math.round(dpp * PPN_RATE) : 0;
  const total = dpp + ppn;
  return { subtotal, diskonNominal, dpp, ppn, total };
}

export async function GET(req: NextRequest) {
  const { error, session } = await requirePermission("penjualan.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const q = req.nextUrl.searchParams.get("q") || "";

  const data = await prisma.penjualan.findMany({
    where: { companyId, ...(q ? { nomor: { contains: q } } : {}) },
    include: {
      pelanggan: true,
      user: { select: { name: true } },
      detail: { include: { barang: true } },
    },
    orderBy: { tanggal: "desc" },
  });

  // Perkaya dengan total pembayaran yang sudah masuk (untuk metode
  // KREDIT/TEMPO) supaya UI bisa menampilkan sisa piutang tanpa query terpisah.
  const bayarAgg = await prisma.pembayaran.groupBy({
    by: ["referensiId"],
    where: { companyId, referensiTipe: "penjualan", referensiId: { in: data.map((d) => d.id) } },
    _sum: { jumlah: true },
  });
  const bayarMap = new Map(bayarAgg.map((b) => [b.referensiId, Number(b._sum.jumlah ?? 0)]));

  const enriched = data.map((p) => {
    const totalDibayar = bayarMap.get(p.id) ?? 0;
    return {
      ...p,
      totalDibayar,
      sisa: isLunasDiMuka(p.metodeBayar) ? 0 : Number(p.total) - totalDibayar,
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("penjualan.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const body = await req.json();
  const parsed = penjualanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const { items, pelangganId, catatan, tanggal, diskonPersen = 0, pakaiPpn = true, metodeBayar = "TUNAI" } = parsed.data;

  const barangIds = items.map((i) => i.barangId);
  // companyId di sini penting: mencegah user menjual barangId milik perusahaan lain.
  const barangList = await prisma.barang.findMany({ where: { id: { in: barangIds }, companyId } });

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

  const { subtotal, diskonNominal, dpp, ppn, total } = hitungRingkasan(items, diskonPersen, pakaiPpn);
  // HPP (harga pokok penjualan) dihitung dari harga BELI barang saat ini,
  // bukan harga jual, dan TIDAK dipengaruhi diskon/PPN sisi jual — dipakai
  // untuk jurnal otomatis & laporan laba rugi.
  const hpp = items.reduce((sum, item) => {
    const barang = barangList.find((b) => b.id === item.barangId);
    return sum + item.qty * Number(barang?.hargaBeli ?? 0);
  }, 0);
  const nomor = await generateNomor(companyId);

  const result = await prisma.$transaction(async (tx) => {
    const penjualan = await tx.penjualan.create({
      data: {
        companyId,
        nomor,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        pelangganId: pelangganId ?? null,
        userId: Number(session!.user.id),
        catatan,
        metodeBayar,
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
      include: { detail: true },
    });

    for (const item of items) {
      await tx.barang.update({
        where: { id: item.barangId },
        data: { stok: { decrement: item.qty } },
      });
    }

    // Fail-safe: jangan sampai penjualan gagal hanya karena Chart of Akun
    // belum disiapkan. Jurnal bisa diposting manual belakangan jika perlu.
    try {
      await jurnalPenjualan(tx, {
        companyId,
        penjualanId: penjualan.id,
        nomor: penjualan.nomor,
        tanggal: penjualan.tanggal,
        dpp,
        ppn,
        total,
        hpp,
        metodeBayar,
        userId: Number(session!.user.id),
      });
    } catch (err) {
      console.error("Gagal posting jurnal otomatis untuk penjualan", penjualan.nomor, err);
    }

    return penjualan;
  });

  return NextResponse.json(result, { status: 201 });
}
