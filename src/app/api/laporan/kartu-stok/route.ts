import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

type Pergerakan = {
  tanggal: string;
  tipe: "PENGADAAN" | "PENJUALAN" | "RETUR_PEMBELIAN" | "RETUR_PENJUALAN";
  nomor: string;
  pihak: string;
  keterangan: string | null;
  masuk: number;
  keluar: number;
};

/**
 * Kartu Stok — log kronologis semua pergerakan stok satu barang, digabung
 * dari 3 sumber: PengadaanDetail (masuk), PenjualanDetail (keluar), dan
 * DetailRetur (arahnya tergantung Retur.jenis — lihat komentar di bawah).
 * Saldo berjalan SELALU dihitung dari seluruh riwayat (bukan dari filter
 * tanggal) supaya angkanya tetap akurat & rekonsiliasi dengan Barang.stok;
 * filter start/end hanya memotong baris mana yang ditampilkan.
 */
export async function GET(req: NextRequest) {
  const { error, session } = await requirePermission("barang.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const barangId = Number(req.nextUrl.searchParams.get("barangId"));
  if (!barangId) {
    return NextResponse.json({ message: "Parameter barangId wajib diisi" }, { status: 400 });
  }

  const barang = await prisma.barang.findFirst({ where: { id: barangId, companyId } });
  if (!barang) return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 });

  const [pengadaanDetail, penjualanDetail, returDetail] = await Promise.all([
    prisma.pengadaanDetail.findMany({
      where: { barangId, pengadaan: { companyId } },
      include: { pengadaan: { include: { supplier: true } } },
    }),
    prisma.penjualanDetail.findMany({
      where: { barangId, penjualan: { companyId } },
      include: { penjualan: { include: { pelanggan: true } } },
    }),
    prisma.detailRetur.findMany({
      where: { barangId, retur: { companyId } },
      include: { retur: true },
    }),
  ]);

  // Retur bersifat polimorfik ke transaksi asalnya (referensiTipe/referensiId,
  // bukan relasi FK langsung) -- ambil nomor & pihak transaksi asal untuk
  // keterangan, pola sama seperti enrichment di GET /api/retur.
  const pengadaanIds = returDetail.filter((d) => d.retur.referensiTipe === "pengadaan").map((d) => d.retur.referensiId);
  const penjualanIds = returDetail.filter((d) => d.retur.referensiTipe === "penjualan").map((d) => d.retur.referensiId);
  const [refPengadaan, refPenjualan] = await Promise.all([
    pengadaanIds.length
      ? prisma.pengadaan.findMany({ where: { id: { in: pengadaanIds } }, include: { supplier: true } })
      : Promise.resolve([]),
    penjualanIds.length
      ? prisma.penjualan.findMany({ where: { id: { in: penjualanIds } }, include: { pelanggan: true } })
      : Promise.resolve([]),
  ]);

  const pergerakan: Pergerakan[] = [];

  for (const d of pengadaanDetail) {
    pergerakan.push({
      tanggal: d.pengadaan.tanggal.toISOString(),
      tipe: "PENGADAAN",
      nomor: d.pengadaan.nomor,
      pihak: d.pengadaan.supplier?.nama ?? "-",
      keterangan: null,
      masuk: d.qty,
      keluar: 0,
    });
  }

  for (const d of penjualanDetail) {
    pergerakan.push({
      tanggal: d.penjualan.tanggal.toISOString(),
      tipe: "PENJUALAN",
      nomor: d.penjualan.nomor,
      pihak: d.penjualan.pelanggan?.nama ?? "Umum",
      keterangan: null,
      masuk: 0,
      keluar: d.qty,
    });
  }

  // PEMBELIAN = retur ke supplier -> stok berkurang (keluar).
  // PENJUALAN = retur dari pelanggan -> stok bertambah (masuk).
  for (const d of returDetail) {
    const isReturPembelian = d.retur.jenis === "PEMBELIAN";
    const ref =
      d.retur.referensiTipe === "pengadaan"
        ? refPengadaan.find((p) => p.id === d.retur.referensiId)
        : refPenjualan.find((p) => p.id === d.retur.referensiId);
    const pihak = ref ? ((ref as any).supplier?.nama ?? (ref as any).pelanggan?.nama ?? "-") : "-";

    pergerakan.push({
      tanggal: d.retur.tanggal.toISOString(),
      tipe: isReturPembelian ? "RETUR_PEMBELIAN" : "RETUR_PENJUALAN",
      nomor: d.retur.nomor,
      pihak,
      keterangan: ref ? `Retur dari transaksi ${ref.nomor}` : null,
      masuk: isReturPembelian ? 0 : d.qty,
      keluar: isReturPembelian ? d.qty : 0,
    });
  }

  pergerakan.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  let saldo = 0;
  const withSaldo = pergerakan.map((p) => {
    saldo += p.masuk - p.keluar;
    return { ...p, saldo };
  });

  // Filter tanggal (opsional) hanya memotong tampilan -- saldo di atas sudah
  // dihitung dari riwayat penuh supaya "Saldo Awal" periode tetap akurat.
  const startParam = req.nextUrl.searchParams.get("start");
  const endParam = req.nextUrl.searchParams.get("end");
  const startDate = startParam ? new Date(startParam) : null;
  const endDate = endParam ? new Date(`${endParam}T23:59:59.999`) : null;

  let saldoAwal = 0;
  let filtered = withSaldo;
  if (startDate || endDate) {
    const sebelumRange = startDate ? withSaldo.filter((p) => new Date(p.tanggal) < startDate) : [];
    saldoAwal = sebelumRange.length ? sebelumRange[sebelumRange.length - 1].saldo : 0;
    filtered = withSaldo.filter((p) => (!startDate || new Date(p.tanggal) >= startDate) && (!endDate || new Date(p.tanggal) <= endDate));
  }

  return NextResponse.json({
    barang: { id: barang.id, kode: barang.kode, nama: barang.nama, satuan: barang.satuan, stokSaatIni: barang.stok },
    saldoAwal,
    pergerakan: filtered,
  });
}
