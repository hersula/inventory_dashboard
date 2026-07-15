import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";
import { jurnalPembayaranHutang, jurnalPembayaranPiutang, generateNomorPembayaran, isLunasDiMuka } from "@/lib/akuntansi";
import { z } from "zod";

const pembayaranSchema = z.object({
  tipe: z.enum(["HUTANG", "PIUTANG"]),
  referensiId: z.number(),
  tanggal: z.string().optional(),
  jumlah: z.number().positive("Jumlah pembayaran harus lebih dari 0"),
  metodeBayar: z.enum(["TUNAI", "TRANSFER"]),
  keterangan: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { error, session } = await requirePermission("akuntansi.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const tipe = req.nextUrl.searchParams.get("tipe");

  const data = await prisma.pembayaran.findMany({
    where: { companyId, ...(tipe ? { tipe: tipe as "HUTANG" | "PIUTANG" } : {}) },
    include: { user: { select: { name: true } } },
    orderBy: { tanggal: "desc" },
  });

  // referensi (pengadaan/penjualan) bersifat polimorfik (bukan relasi FK
  // langsung), jadi nomor & nama pihak-nya diambil manual lalu digabung.
  const pengadaanIds = data.filter((p) => p.referensiTipe === "pengadaan").map((p) => p.referensiId);
  const penjualanIds = data.filter((p) => p.referensiTipe === "penjualan").map((p) => p.referensiId);

  const [pengadaanList, penjualanList] = await Promise.all([
    pengadaanIds.length
      ? prisma.pengadaan.findMany({ where: { id: { in: pengadaanIds } }, include: { supplier: true } })
      : Promise.resolve([]),
    penjualanIds.length
      ? prisma.penjualan.findMany({ where: { id: { in: penjualanIds } }, include: { pelanggan: true } })
      : Promise.resolve([]),
  ]);

  const enriched = data.map((p) => {
    if (p.referensiTipe === "pengadaan") {
      const ref = pengadaanList.find((x) => x.id === p.referensiId);
      return { ...p, referensi: ref ? { nomor: ref.nomor, pihak: ref.supplier?.nama ?? "-" } : null };
    }
    const ref = penjualanList.find((x) => x.id === p.referensiId);
    return { ...p, referensi: ref ? { nomor: ref.nomor, pihak: ref.pelanggan?.nama ?? "Umum" } : null };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requirePermission("akuntansi.manage");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const body = await req.json();
  const parsed = pembayaranSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid", issues: parsed.error.issues }, { status: 400 });
  }
  const { tipe, referensiId, tanggal, jumlah, metodeBayar, keterangan } = parsed.data;
  const referensiTipe = tipe === "HUTANG" ? "pengadaan" : "penjualan";

  // Ambil transaksi sumber + validasi: milik perusahaan ini, metode bayar
  // memang KREDIT/TEMPO (bukan tunai/transfer yang sudah lunas di muka),
  // dan jumlah yang dibayar tidak melebihi sisa yang belum dilunasi.
  const trx =
    referensiTipe === "pengadaan"
      ? await prisma.pengadaan.findFirst({ where: { id: referensiId, companyId } })
      : await prisma.penjualan.findFirst({ where: { id: referensiId, companyId } });

  if (!trx) {
    return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
  }
  if (isLunasDiMuka(trx.metodeBayar)) {
    return NextResponse.json(
      { message: "Transaksi ini metode bayarnya Tunai/Transfer (sudah lunas di muka), tidak perlu dicatat pembayaran." },
      { status: 400 }
    );
  }

  const sudahDibayarAgg = await prisma.pembayaran.aggregate({
    where: { companyId, referensiTipe, referensiId },
    _sum: { jumlah: true },
  });
  const sudahDibayar = Number(sudahDibayarAgg._sum.jumlah ?? 0);
  const sisa = Number(trx.total) - sudahDibayar;

  if (jumlah > sisa + 0.5) {
    // toleransi kecil untuk pembulatan
    return NextResponse.json(
      { message: `Jumlah pembayaran (Rp ${jumlah.toLocaleString("id-ID")}) melebihi sisa yang belum dilunasi (Rp ${sisa.toLocaleString("id-ID")}).` },
      { status: 400 }
    );
  }

  const nomor = await generateNomorPembayaran(prisma, companyId, tipe);
  const tanggalDate = tanggal ? new Date(tanggal) : new Date();
  const keteranganFull = keterangan || `Pembayaran ${tipe === "HUTANG" ? "hutang" : "piutang"} untuk ${trx.nomor}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const pembayaran = await tx.pembayaran.create({
        data: {
          companyId,
          nomor,
          tanggal: tanggalDate,
          tipe,
          referensiTipe,
          referensiId,
          jumlah,
          metodeBayar,
          keterangan,
          userId: Number(session!.user.id),
        },
      });

      if (tipe === "HUTANG") {
        await jurnalPembayaranHutang(tx, {
          companyId,
          pembayaranId: pembayaran.id,
          nomor: pembayaran.nomor,
          tanggal: tanggalDate,
          jumlah,
          metodeBayar,
          userId: Number(session!.user.id),
          keterangan: keteranganFull,
        });
      } else {
        await jurnalPembayaranPiutang(tx, {
          companyId,
          pembayaranId: pembayaran.id,
          nomor: pembayaran.nomor,
          tanggal: tanggalDate,
          jumlah,
          metodeBayar,
          userId: Number(session!.user.id),
          keterangan: keteranganFull,
        });
      }

      return pembayaran;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("Gagal mencatat pembayaran:", err);
    return NextResponse.json({ message: err.message || "Gagal mencatat pembayaran" }, { status: 500 });
  }
}
