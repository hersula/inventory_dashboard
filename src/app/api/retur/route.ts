import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { generateNomorRetur, jurnalReturPembelian, jurnalReturPenjualan } from "@/lib/akuntansi";
import { z } from "zod";

const returSchema = z.object({
  jenis: z.enum(["PEMBELIAN", "PENJUALAN"]),
  referensiId: z.number(),
  tanggal: z.string().optional(),
  catatan: z.string().optional().nullable(),
  items: z.array(z.object({ barangId: z.number(), qty: z.number().int().positive() })).min(1, "Minimal 1 item barang"),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requirePermission("retur.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const jenis = req.nextUrl.searchParams.get("jenis");

  const data = await prisma.retur.findMany({
    where: { companyId, ...(jenis === "PEMBELIAN" || jenis === "PENJUALAN" ? { jenis } : {}) },
    include: { user: { select: { name: true } }, detail: { include: { barang: true } } },
    orderBy: { tanggal: "desc" },
  });

  // referensi (pengadaan/penjualan) bersifat polimorfik (bukan relasi FK
  // langsung), jadi nomor & nama pihak-nya diambil manual lalu digabung —
  // pola yang sama seperti GET /api/pembayaran.
  const pengadaanIds = data.filter((r) => r.referensiTipe === "pengadaan").map((r) => r.referensiId);
  const penjualanIds = data.filter((r) => r.referensiTipe === "penjualan").map((r) => r.referensiId);

  const [pengadaanList, penjualanList] = await Promise.all([
    pengadaanIds.length ? prisma.pengadaan.findMany({ where: { id: { in: pengadaanIds } }, include: { supplier: true } }) : Promise.resolve([]),
    penjualanIds.length ? prisma.penjualan.findMany({ where: { id: { in: penjualanIds } }, include: { pelanggan: true } }) : Promise.resolve([]),
  ]);

  const enriched = data.map((r) => {
    if (r.referensiTipe === "pengadaan") {
      const ref = pengadaanList.find((x) => x.id === r.referensiId);
      return { ...r, referensi: ref ? { nomor: ref.nomor, pihak: ref.supplier?.nama ?? "-" } : null };
    }
    const ref = penjualanList.find((x) => x.id === r.referensiId);
    return { ...r, referensi: ref ? { nomor: ref.nomor, pihak: ref.pelanggan?.nama ?? "Umum" } : null };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("retur.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const body = await req.json();
  const parsed = returSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }
  const { jenis, referensiId, tanggal, catatan, items } = parsed.data;
  const referensiTipe = jenis === "PEMBELIAN" ? "pengadaan" : "penjualan";

  const trx =
    referensiTipe === "pengadaan"
      ? await prisma.pengadaan.findFirst({ where: { id: referensiId, companyId }, include: { detail: true } })
      : await prisma.penjualan.findFirst({ where: { id: referensiId, companyId }, include: { detail: true } });

  if (!trx) return NextResponse.json({ message: "Transaksi yang diretur tidak ditemukan" }, { status: 404 });

  // Validasi tiap item: harus benar-benar ada di transaksi asal, dan qty
  // retur (ditambah retur sebelumnya untuk barang yang sama) tidak boleh
  // melebihi qty pada transaksi asal.
  const returSebelumnya = await prisma.detailRetur.findMany({
    where: { retur: { companyId, referensiTipe, referensiId } },
    select: { barangId: true, qty: true },
  });
  const sudahDiretur = new Map<number, number>();
  for (const r of returSebelumnya) sudahDiretur.set(r.barangId, (sudahDiretur.get(r.barangId) ?? 0) + r.qty);

  const detailItems: { barangId: number; qty: number; hargaSatuan: number; subtotal: number }[] = [];
  for (const item of items) {
    const asal = trx.detail.find((d) => d.barangId === item.barangId);
    if (!asal) {
      return NextResponse.json({ message: `Barang (ID ${item.barangId}) tidak ada di transaksi ${trx.nomor}` }, { status: 400 });
    }
    const sisa = asal.qty - (sudahDiretur.get(item.barangId) ?? 0);
    if (item.qty > sisa) {
      return NextResponse.json(
        { message: `Qty retur untuk salah satu barang melebihi sisa yang bisa diretur (maks. ${sisa})` },
        { status: 409 }
      );
    }
    detailItems.push({
      barangId: item.barangId,
      qty: item.qty,
      hargaSatuan: Number(asal.hargaSatuan),
      subtotal: item.qty * Number(asal.hargaSatuan),
    });
  }

  if (jenis === "PEMBELIAN") {
    // Barang keluar lagi dari gudang (dikembalikan ke supplier) -> stok harus
    // cukup. Bisa saja sudah tidak cukup kalau sebagian sudah terjual lagi.
    const barangList = await prisma.barang.findMany({ where: { id: { in: detailItems.map((d) => d.barangId) }, companyId } });
    for (const item of detailItems) {
      const barang = barangList.find((b) => b.id === item.barangId);
      if (!barang || barang.stok < item.qty) {
        return NextResponse.json(
          { message: `Stok "${barang?.nama ?? item.barangId}" tidak mencukupi untuk retur (kemungkinan sudah terjual lagi)` },
          { status: 409 }
        );
      }
    }
  }

  const total = detailItems.reduce((s, d) => s + d.subtotal, 0);
  const tanggalDate = tanggal ? new Date(tanggal) : new Date();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const nomor = await generateNomorRetur(tx, companyId, jenis);

      const retur = await tx.retur.create({
        data: {
          companyId,
          nomor,
          tanggal: tanggalDate,
          jenis,
          referensiTipe,
          referensiId,
          userId: Number(session!.user.id),
          catatan,
          total,
          detail: { create: detailItems },
        },
        include: { detail: { include: { barang: true } } },
      });

      for (const item of detailItems) {
        await tx.barang.update({
          where: { id: item.barangId },
          data: { stok: { [jenis === "PEMBELIAN" ? "decrement" : "increment"]: item.qty } },
        });
      }

      // Posting jurnal bersifat fail-safe seperti modul transaksi lain — kalau
      // Chart of Akun belum lengkap, retur tetap tersimpan (jurnal manual belakangan).
      try {
        if (jenis === "PEMBELIAN") {
          await jurnalReturPembelian(tx, {
            companyId,
            returId: retur.id,
            nomor,
            tanggal: tanggalDate,
            nilai: total,
            metodeBayarAsal: trx.metodeBayar,
            userId: Number(session!.user.id),
          });
        } else {
          const hpp = retur.detail.reduce((s, d) => s + d.qty * Number(d.barang.hargaBeli), 0);
          await jurnalReturPenjualan(tx, {
            companyId,
            returId: retur.id,
            nomor,
            tanggal: tanggalDate,
            nilaiJual: total,
            hpp,
            metodeBayarAsal: trx.metodeBayar,
            userId: Number(session!.user.id),
          });
        }
      } catch (err) {
        console.error("Gagal posting jurnal otomatis untuk retur", nomor, err);
      }

      return retur;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("Gagal mencatat retur:", err);
    return NextResponse.json({ message: err.message || "Gagal mencatat retur" }, { status: 500 });
  }
}
