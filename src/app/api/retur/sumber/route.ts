import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getCompanyId } from "@/lib/apiAuth";

/**
 * Dipakai form Retur untuk menampilkan daftar item dari SATU transaksi
 * Pengadaan/Penjualan yang dipilih, lengkap dengan berapa qty yang sudah
 * pernah diretur sebelumnya (dari retur lain) supaya form bisa membatasi
 * input qty retur baru ke sisa yang belum diretur.
 */
export async function GET(req: NextRequest) {
  const { error, session } = await requirePermission("retur.view");
  if (error) return error;
  const companyId = getCompanyId(session!);

  const jenis = req.nextUrl.searchParams.get("jenis");
  const referensiId = Number(req.nextUrl.searchParams.get("referensiId"));
  if ((jenis !== "PEMBELIAN" && jenis !== "PENJUALAN") || !referensiId) {
    return NextResponse.json({ message: "Parameter jenis/referensiId tidak valid" }, { status: 400 });
  }
  const referensiTipe = jenis === "PEMBELIAN" ? "pengadaan" : "penjualan";

  const trx =
    referensiTipe === "pengadaan"
      ? await prisma.pengadaan.findFirst({
          where: { id: referensiId, companyId },
          include: { supplier: true, detail: { include: { barang: true } } },
        })
      : await prisma.penjualan.findFirst({
          where: { id: referensiId, companyId },
          include: { pelanggan: true, detail: { include: { barang: true } } },
        });

  if (!trx) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

  // Jumlahkan qty yang sudah diretur sebelumnya per barang, dari seluruh
  // Retur (manapun) yang menunjuk ke transaksi ini.
  const returSebelumnya = await prisma.detailRetur.findMany({
    where: { retur: { companyId, referensiTipe, referensiId } },
    select: { barangId: true, qty: true },
  });
  const sudahDiretur = new Map<number, number>();
  for (const r of returSebelumnya) {
    sudahDiretur.set(r.barangId, (sudahDiretur.get(r.barangId) ?? 0) + r.qty);
  }

  return NextResponse.json({
    nomor: trx.nomor,
    tanggal: trx.tanggal,
    metodeBayar: trx.metodeBayar,
    pihak: referensiTipe === "pengadaan" ? (trx as any).supplier?.nama ?? "-" : (trx as any).pelanggan?.nama ?? "Umum",
    items: trx.detail.map((d) => {
      const sudah = sudahDiretur.get(d.barangId) ?? 0;
      return {
        barangId: d.barangId,
        kode: d.barang.kode,
        nama: d.barang.nama,
        satuan: d.barang.satuan,
        hargaBeli: d.barang.hargaBeli,
        qtyAsal: d.qty,
        hargaSatuan: d.hargaSatuan,
        sudahDiretur: sudah,
        sisaBisaDiretur: Math.max(0, d.qty - sudah),
      };
    }),
  });
}
