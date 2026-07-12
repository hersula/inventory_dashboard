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
  HUTANG_USAHA: "2101",
  PENDAPATAN_PENJUALAN: "4101",
  HPP: "5101",
} as const;

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
 * Asumsi sederhana: pembelian tunai.
 *   Debit  Persediaan Barang Dagang
 *   Kredit Kas
 * (Jika suatu saat dibutuhkan pembelian kredit/hutang, tinggal ganti akun
 * KREDIT ke Hutang Usaha — lihat KODE_AKUN.HUTANG_USAHA.)
 */
export async function jurnalPengadaan(
  tx: TxClient,
  params: { companyId: number; pengadaanId: number; nomor: string; tanggal: Date; total: number; userId: number }
) {
  if (params.total <= 0) return null;
  const [persediaanId, kasId] = await Promise.all([
    getAkunId(tx, KODE_AKUN.PERSEDIAAN, params.companyId),
    getAkunId(tx, KODE_AKUN.KAS, params.companyId),
  ]);

  return postJurnal(tx, {
    companyId: params.companyId,
    tanggal: params.tanggal,
    keterangan: `Pengadaan barang ${params.nomor}`,
    referensiTipe: "pengadaan",
    referensiId: params.pengadaanId,
    userId: params.userId,
    lines: [
      { akunId: persediaanId, debit: params.total, keterangan: "Persediaan bertambah" },
      { akunId: kasId, kredit: params.total, keterangan: "Pembayaran tunai ke supplier" },
    ],
  });
}

/**
 * Posting jurnal otomatis untuk transaksi PENJUALAN (barang keluar).
 * Dua pasang entri sekaligus (standar akuntansi dagang):
 *   1) Pengakuan pendapatan — Debit Kas, Kredit Pendapatan Penjualan (sebesar harga jual)
 *   2) Pengakuan HPP        — Debit HPP, Kredit Persediaan (sebesar harga beli / cost)
 * `hpp` dihitung dari qty x harga beli barang saat transaksi terjadi.
 */
export async function jurnalPenjualan(
  tx: TxClient,
  params: {
    companyId: number;
    penjualanId: number;
    nomor: string;
    tanggal: Date;
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
    { akunId: pendapatanId, kredit: params.total, keterangan: "Pendapatan penjualan" },
  ];

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
