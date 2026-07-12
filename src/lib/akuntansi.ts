import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * Kode akun default yang dipakai sistem untuk posting jurnal OTOMATIS dari
 * transaksi Pengadaan & Penjualan. Kode-kode ini dibuat lewat prisma/seed.ts
 * atau otomatis saat perusahaan baru mendaftar (src/app/api/register/route.ts)
 * — jangan ubah kode-nya tanpa menyesuaikan kedua tempat itu.
 */
export const KODE_AKUN = {
  KAS: "1101",
  PERSEDIAAN: "1103",
  PPN_MASUKAN: "1104",
  HUTANG_USAHA: "2101",
  PPN_KELUARAN: "2102",
  PENDAPATAN_PENJUALAN: "4101",
  HPP: "5101",
} as const;

/** Tarif PPN yang berlaku (11%) — satu sumber kebenaran dipakai di semua route transaksi. */
export const PPN_RATE = 0.11;

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

// Semua akun & jurnal bersifat MULTI-TENANT: kode akun ("1101" dst) hanya
// unik dalam satu perusahaan (companyId), sehingga setiap lookup/posting di
// bawah ini WAJIB menyertakan companyId.
async function getAkunId(tx: TxClient, kode: string, companyId: number): Promise<number> {
  const akun = await tx.akun.findFirst({ where: { kode, companyId } });
  if (!akun) {
    throw new Error(
      `Akun dengan kode ${kode} tidak ditemukan untuk perusahaan ini. Buat akunnya manual di modul Akuntansi, atau daftar ulang lewat seed.`
    );
  }
  return akun.id;
}

async function generateNomorJurnal(tx: TxClient, companyId: number) {
  const now = new Date();
  const prefix = `JU-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await tx.jurnalEntry.count({ where: { companyId, nomor: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

type JurnalLine = { akunId: number; debit?: number; kredit?: number; keterangan?: string };

/**
 * Membuat satu JurnalEntry + baris-barisnya. Melempar error jika total debit
 * != total kredit (aturan dasar double-entry bookkeeping) sehingga transaksi
 * yang memicunya (dibungkus $transaction) ikut di-rollback.
 */
export async function postJurnal(
  tx: TxClient,
  params: {
    companyId: number;
    tanggal: Date;
    keterangan: string;
    referensiTipe: string;
    referensiId: number | null;
    userId: number;
    lines: JurnalLine[];
  }
) {
  const totalDebit = params.lines.reduce((s, l) => s + (l.debit ?? 0), 0);
  const totalKredit = params.lines.reduce((s, l) => s + (l.kredit ?? 0), 0);

  if (Math.round(totalDebit * 100) !== Math.round(totalKredit * 100)) {
    throw new Error(
      `Jurnal tidak balance: total debit (${totalDebit}) harus sama dengan total kredit (${totalKredit}).`
    );
  }

  const nomor = await generateNomorJurnal(tx, params.companyId);

  return tx.jurnalEntry.create({
    data: {
      companyId: params.companyId,
      nomor,
      tanggal: params.tanggal,
      keterangan: params.keterangan,
      referensiTipe: params.referensiTipe,
      referensiId: params.referensiId,
      userId: params.userId,
      detail: {
        create: params.lines.map((l) => ({
          akunId: l.akunId,
          debit: l.debit ?? 0,
          kredit: l.kredit ?? 0,
          keterangan: l.keterangan,
        })),
      },
    },
  });
}

/** Menghapus semua jurnal otomatis yang terkait suatu transaksi (dipakai saat edit/batal). */
export async function hapusJurnalReferensi(tx: TxClient, referensiTipe: string, referensiId: number) {
  await tx.jurnalEntry.deleteMany({ where: { referensiTipe, referensiId } });
}

/**
 * Posting jurnal otomatis untuk transaksi PENGADAAN (barang masuk).
 * Asumsi sederhana: pembelian tunai. `dpp` (Dasar Pengenaan Pajak) adalah
 * subtotal SETELAH diskon tapi SEBELUM PPN — itulah nilai yang menambah
 * Persediaan. PPN Masukan dicatat terpisah sebagai piutang pajak (bisa
 * dikreditkan), bukan bagian dari nilai persediaan.
 *   Debit  Persediaan Barang Dagang   (dpp)
 *   Debit  PPN Masukan                (ppn, jika > 0)
 *   Kredit Kas                        (dpp + ppn = total dibayar)
 * (Jika suatu saat dibutuhkan pembelian kredit/hutang, tinggal ganti akun
 * KREDIT ke Hutang Usaha — lihat KODE_AKUN.HUTANG_USAHA.)
 */
export async function jurnalPengadaan(
  tx: TxClient,
  params: {
    companyId: number;
    pengadaanId: number;
    nomor: string;
    tanggal: Date;
    dpp: number;
    ppn: number;
    total: number;
    userId: number;
  }
) {
  if (params.total <= 0) return null;
  const [persediaanId, kasId] = await Promise.all([
    getAkunId(tx, KODE_AKUN.PERSEDIAAN, params.companyId),
    getAkunId(tx, KODE_AKUN.KAS, params.companyId),
  ]);

  const lines: JurnalLine[] = [
    { akunId: persediaanId, debit: params.dpp, keterangan: "Persediaan bertambah" },
  ];

  if (params.ppn > 0) {
    const ppnMasukanId = await getAkunId(tx, KODE_AKUN.PPN_MASUKAN, params.companyId);
    lines.push({ akunId: ppnMasukanId, debit: params.ppn, keterangan: "PPN Masukan 11%" });
  }

  lines.push({ akunId: kasId, kredit: params.total, keterangan: "Pembayaran tunai ke supplier" });

  return postJurnal(tx, {
    companyId: params.companyId,
    tanggal: params.tanggal,
    keterangan: `Pengadaan barang ${params.nomor}`,
    referensiTipe: "pengadaan",
    referensiId: params.pengadaanId,
    userId: params.userId,
    lines,
  });
}

/**
 * Posting jurnal otomatis untuk transaksi PENJUALAN (barang keluar).
 * `dpp` (Dasar Pengenaan Pajak) adalah subtotal SETELAH diskon tapi SEBELUM
 * PPN — itulah nilai yang diakui sebagai Pendapatan. PPN Keluaran dicatat
 * terpisah sebagai utang pajak ke kas negara, bukan bagian dari pendapatan.
 *   1) Pengakuan penjualan — Debit Kas (dpp + ppn), Kredit Pendapatan Penjualan (dpp),
 *                            Kredit PPN Keluaran (ppn, jika > 0)
 *   2) Pengakuan HPP       — Debit HPP, Kredit Persediaan (sebesar harga beli / cost,
 *                            tidak dipengaruhi diskon/PPN sisi jual)
 */
export async function jurnalPenjualan(
  tx: TxClient,
  params: {
    companyId: number;
    penjualanId: number;
    nomor: string;
    tanggal: Date;
    dpp: number;
    ppn: number;
    total: number;
    hpp: number;
    userId: number;
  }
) {
  if (params.total <= 0) return null;
  const [kasId, pendapatanId, hppId, persediaanId] = await Promise.all([
    getAkunId(tx, KODE_AKUN.KAS, params.companyId),
    getAkunId(tx, KODE_AKUN.PENDAPATAN_PENJUALAN, params.companyId),
    getAkunId(tx, KODE_AKUN.HPP, params.companyId),
    getAkunId(tx, KODE_AKUN.PERSEDIAAN, params.companyId),
  ]);

  const lines: JurnalLine[] = [
    { akunId: kasId, debit: params.total, keterangan: "Penerimaan tunai dari pelanggan" },
    { akunId: pendapatanId, kredit: params.dpp, keterangan: "Pendapatan penjualan" },
  ];

  if (params.ppn > 0) {
    const ppnKeluaranId = await getAkunId(tx, KODE_AKUN.PPN_KELUARAN, params.companyId);
    lines.push({ akunId: ppnKeluaranId, kredit: params.ppn, keterangan: "PPN Keluaran 11%" });
  }

  if (params.hpp > 0) {
    lines.push(
      { akunId: hppId, debit: params.hpp, keterangan: "Harga pokok penjualan" },
      { akunId: persediaanId, kredit: params.hpp, keterangan: "Persediaan berkurang" }
    );
  }

  return postJurnal(tx, {
    companyId: params.companyId,
    tanggal: params.tanggal,
    keterangan: `Penjualan barang ${params.nomor}`,
    referensiTipe: "penjualan",
    referensiId: params.penjualanId,
    userId: params.userId,
    lines,
  });
}
