import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { jurnalPengadaan, PPN_RATE, isLunasDiMuka } from "@/lib/akuntansi";
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
  diskonPersen: z.number().min(0).max(100).optional(),
  pakaiPpn: z.boolean().optional(),
  metodeBayar: z.enum(["TUNAI", "KREDIT", "TEMPO"]).optional(),
  items: z.array(itemSchema).min(1, "Minimal 1 item barang"),
});

async function generateNomor(companyId: number) {
  const now = new Date();
  const prefix = `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.pengadaan.count({
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
  const { error, session } = await requirePermission("pengadaan.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const q = req.nextUrl.searchParams.get("q") || "";

  const data = await prisma.pengadaan.findMany({
    where: { companyId, ...(q ? { nomor: { contains: q } } : {}) },
    include: {
      supplier: true,
      user: { select: { name: true } },
      detail: { include: { barang: true } },
    },
    orderBy: { tanggal: "desc" },
  });

  // Perkaya dengan total pembayaran yang sudah masuk (untuk metode
  // KREDIT/TEMPO) supaya UI bisa menampilkan sisa hutang tanpa query terpisah.
  const bayarAgg = await prisma.pembayaran.groupBy({
    by: ["referensiId"],
    where: { companyId, referensiTipe: "pengadaan", referensiId: { in: data.map((d) => d.id) } },
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
  const { error, session } = await requirePermission("pengadaan.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const body = await req.json();
  const parsed = pengadaanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }

  const { items, supplierId, catatan, tanggal, diskonPersen = 0, pakaiPpn = true, metodeBayar = "TUNAI" } = parsed.data;

  // Pastikan semua barang yang dipilih benar-benar milik perusahaan ini
  // (mencegah user mereferensikan barangId milik perusahaan lain).
  const barangIds = items.map((i) => i.barangId);
  const ownedCount = await prisma.barang.count({ where: { id: { in: barangIds }, companyId } });
  if (ownedCount !== new Set(barangIds).size) {
    return NextResponse.json({ message: "Salah satu barang tidak ditemukan" }, { status: 400 });
  }

  const { subtotal, diskonNominal, dpp, ppn, total } = hitungRingkasan(items, diskonPersen, pakaiPpn);
  const nomor = await generateNomor(companyId);

  const result = await prisma.$transaction(async (tx) => {
    const pengadaan = await tx.pengadaan.create({
      data: {
        companyId,
        nomor,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        supplierId: supplierId ?? null,
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
        data: { stok: { increment: item.qty } },
      });
    }

    // Posting jurnal bersifat fail-safe: jika Chart of Akun belum disiapkan
    // (mis. instalasi baru yang belum menjalankan seed), transaksi pengadaan
    // tetap berhasil — jurnal cukup diposting manual belakangan lewat modul Akuntansi.
    try {
      await jurnalPengadaan(tx, {
        companyId,
        pengadaanId: pengadaan.id,
        nomor: pengadaan.nomor,
        tanggal: pengadaan.tanggal,
        dpp,
        ppn,
        total,
        metodeBayar,
        userId: Number(session!.user.id),
      });
    } catch (err) {
      console.error("Gagal posting jurnal otomatis untuk pengadaan", pengadaan.nomor, err);
    }

    return pengadaan;
  });

  return NextResponse.json(result, { status: 201 });
}
