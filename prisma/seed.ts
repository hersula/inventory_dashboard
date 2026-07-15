import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { jurnalPengadaan, jurnalPenjualan, jurnalPembayaranHutang, generateNomorPembayaran } from "../src/lib/akuntansi";
import { DEFAULT_AKUN } from "../src/lib/defaultAkun";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // MULTI-TENANT: seed ini membuat SATU perusahaan contoh ("Toko Demo").
  // Semua data di bawah (user, barang, transaksi, akun) terikat ke company ini.
  const company = await prisma.company.upsert({
    where: { slug: "toko-demo" },
    update: {},
    create: { nama: "Toko Demo", slug: "toko-demo", email: "admin@toko.com" },
  });

  await prisma.user.createMany({
    data: [
      { companyId: company.id, name: "Administrator", email: "admin@toko.com", password, role: "ADMIN" },
      { companyId: company.id, name: "Manajer Gudang", email: "manager@toko.com", password, role: "MANAGER" },
      { companyId: company.id, name: "Staff Gudang", email: "staff@toko.com", password, role: "STAFF" },
    ],
    skipDuplicates: true,
  });

  // Chart of Akun (COA) default — kode-kode ini dipakai src/lib/akuntansi.ts
  // untuk posting jurnal OTOMATIS dari transaksi Pengadaan & Penjualan.
  for (const a of DEFAULT_AKUN) {
    await prisma.akun.upsert({
      where: { companyId_kode: { companyId: company.id, kode: a.kode } },
      update: {},
      create: { ...a, companyId: company.id },
    });
  }

  const kategoriData = ["Elektronik", "Alat Tulis Kantor", "Bahan Baku", "Aksesoris"];
  for (const nama of kategoriData) {
    await prisma.kategori.upsert({
      where: { companyId_nama: { companyId: company.id, nama } },
      update: {},
      create: { nama, companyId: company.id },
    });
  }
  const kategoris = await prisma.kategori.findMany({ where: { companyId: company.id } });

  const supplier = await prisma.supplier.create({
    data: {
      companyId: company.id,
      nama: "PT Sumber Makmur",
      alamat: "Jl. Industri No. 10, Jakarta",
      telepon: "021-5551234",
      email: "sales@sumbermakmur.co.id",
    },
  });

  const pelanggan = await prisma.pelanggan.create({
    data: { companyId: company.id, nama: "Toko Berkah Jaya", alamat: "Jl. Merdeka No. 5, Bogor", telepon: "0251-4441234" },
  });

  const barangData = [
    { kode: "BRG-001", nama: "Mouse Wireless Logitech", kategori: "Elektronik", satuan: "pcs", hargaBeli: 65000, hargaJual: 95000, stok: 42, stokMinimum: 10 },
    { kode: "BRG-002", nama: "Keyboard Mechanical", kategori: "Elektronik", satuan: "pcs", hargaBeli: 250000, hargaJual: 350000, stok: 18, stokMinimum: 5 },
    { kode: "BRG-003", nama: "Kertas HVS A4 80gr", kategori: "Alat Tulis Kantor", satuan: "rim", hargaBeli: 42000, hargaJual: 52000, stok: 120, stokMinimum: 20 },
    { kode: "BRG-004", nama: "Pulpen Standard AE7", kategori: "Alat Tulis Kantor", satuan: "box", hargaBeli: 18000, hargaJual: 25000, stok: 8, stokMinimum: 10 },
    { kode: "BRG-005", nama: "Kabel USB Type-C", kategori: "Aksesoris", satuan: "pcs", hargaBeli: 15000, hargaJual: 28000, stok: 65, stokMinimum: 15 },
    { kode: "BRG-006", nama: "Benang Jahit Polyester", kategori: "Bahan Baku", satuan: "gulung", hargaBeli: 5000, hargaJual: 8500, stok: 3, stokMinimum: 20 },
    { kode: "BRG-007", nama: "Power Bank 10000mAh", kategori: "Elektronik", satuan: "pcs", hargaBeli: 95000, hargaJual: 145000, stok: 25, stokMinimum: 8 },
    { kode: "BRG-008", nama: "Kain Katun Meteran", kategori: "Bahan Baku", satuan: "meter", hargaBeli: 22000, hargaJual: 35000, stok: 55, stokMinimum: 15 },
  ];

  for (const b of barangData) {
    const kat = kategoris.find((k) => k.nama === b.kategori);
    await prisma.barang.upsert({
      where: { companyId_kode: { companyId: company.id, kode: b.kode } },
      update: {},
      create: {
        companyId: company.id,
        kode: b.kode,
        nama: b.nama,
        kategoriId: kat?.id,
        satuan: b.satuan,
        hargaBeli: b.hargaBeli,
        hargaJual: b.hargaJual,
        stok: b.stok,
        stokMinimum: b.stokMinimum,
      },
    });
  }

  const admin = await prisma.user.findUnique({ where: { email: "admin@toko.com" } });
  const allBarang = await prisma.barang.findMany({ where: { companyId: company.id } });
  const PPN_RATE = 0.11;

  if (admin && allBarang.length > 0) {
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const tanggal = new Date(now.getFullYear(), now.getMonth() - i, 12);
      const b1 = allBarang[i % allBarang.length];
      const qty1 = 5 + i;
      const subtotal1 = Number(b1.hargaJual) * qty1;
      const ppn1 = Math.round(subtotal1 * PPN_RATE);
      const total1 = subtotal1 + ppn1;
      const hpp1 = Number(b1.hargaBeli) * qty1;

      const nomorPj = `PJ-${tanggal.getFullYear()}${String(tanggal.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`;
      const penjualan = await prisma.penjualan.create({
        data: {
          companyId: company.id,
          nomor: nomorPj,
          tanggal,
          pelangganId: pelanggan.id,
          userId: admin.id,
          subtotal: subtotal1,
          diskonPersen: 0,
          diskonNominal: 0,
          ppn: ppn1,
          total: total1,
          detail: {
            create: [
              {
                barangId: b1.id,
                qty: qty1,
                hargaSatuan: b1.hargaJual,
                subtotal: subtotal1,
              },
            ],
          },
        },
      });
      try {
        await jurnalPenjualan(prisma, {
          companyId: company.id,
          penjualanId: penjualan.id,
          nomor: penjualan.nomor,
          tanggal: penjualan.tanggal,
          dpp: subtotal1,
          ppn: ppn1,
          total: total1,
          hpp: hpp1,
          metodeBayar: "TUNAI",
          userId: admin.id,
        });
      } catch (e) {
        console.warn("Lewati jurnal seed penjualan:", (e as Error).message);
      }

      const b2 = allBarang[(i + 2) % allBarang.length];
      const qty2 = 10 + i * 2;
      const subtotal2 = Number(b2.hargaBeli) * qty2;
      const ppn2 = Math.round(subtotal2 * PPN_RATE);
      const total2 = subtotal2 + ppn2;
      const nomorPo = `PO-${tanggal.getFullYear()}${String(tanggal.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`;
      const pengadaan = await prisma.pengadaan.create({
        data: {
          companyId: company.id,
          nomor: nomorPo,
          tanggal,
          supplierId: supplier.id,
          userId: admin.id,
          subtotal: subtotal2,
          diskonPersen: 0,
          diskonNominal: 0,
          ppn: ppn2,
          total: total2,
          detail: {
            create: [
              {
                barangId: b2.id,
                qty: qty2,
                hargaSatuan: b2.hargaBeli,
                subtotal: subtotal2,
              },
            ],
          },
        },
      });
      try {
        await jurnalPengadaan(prisma, {
          companyId: company.id,
          pengadaanId: pengadaan.id,
          nomor: pengadaan.nomor,
          tanggal: pengadaan.tanggal,
          dpp: subtotal2,
          ppn: ppn2,
          total: total2,
          metodeBayar: "TUNAI",
          userId: admin.id,
        });
      } catch (e) {
        console.warn("Lewati jurnal seed pengadaan:", (e as Error).message);
      }
    }

    // Contoh transaksi non-tunai supaya modul Hutang & Piutang ada data demo.
    const bHutang = allBarang[0];
    const qtyHutang = 20;
    const subtotalHutang = Number(bHutang.hargaBeli) * qtyHutang;
    const ppnHutang = Math.round(subtotalHutang * PPN_RATE);
    const totalHutang = subtotalHutang + ppnHutang;
    const pengadaanKredit = await prisma.pengadaan.create({
      data: {
        companyId: company.id,
        nomor: `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-999`,
        tanggal: now,
        supplierId: supplier.id,
        userId: admin.id,
        metodeBayar: "TEMPO",
        subtotal: subtotalHutang,
        diskonPersen: 0,
        diskonNominal: 0,
        ppn: ppnHutang,
        total: totalHutang,
        detail: { create: [{ barangId: bHutang.id, qty: qtyHutang, hargaSatuan: bHutang.hargaBeli, subtotal: subtotalHutang }] },
      },
    });
    try {
      await jurnalPengadaan(prisma, {
        companyId: company.id,
        pengadaanId: pengadaanKredit.id,
        nomor: pengadaanKredit.nomor,
        tanggal: pengadaanKredit.tanggal,
        dpp: subtotalHutang,
        ppn: ppnHutang,
        total: totalHutang,
        metodeBayar: "TEMPO",
        userId: admin.id,
      });
      // Baru dibayar sebagian, supaya "sisa hutang" terlihat di modul Hutang & Piutang.
      const bayarSebagian = Math.round(totalHutang / 2);
      const nomorBayar = await generateNomorPembayaran(prisma, company.id, "HUTANG");
      const pembayaran = await prisma.pembayaran.create({
        data: {
          companyId: company.id,
          nomor: nomorBayar,
          tanggal: now,
          tipe: "HUTANG",
          referensiTipe: "pengadaan",
          referensiId: pengadaanKredit.id,
          jumlah: bayarSebagian,
          metodeBayar: "TUNAI",
          keterangan: "Pembayaran sebagian (contoh data seed)",
          userId: admin.id,
        },
      });
      await jurnalPembayaranHutang(prisma, {
        companyId: company.id,
        pembayaranId: pembayaran.id,
        nomor: pembayaran.nomor,
        tanggal: now,
        jumlah: bayarSebagian,
        metodeBayar: "TUNAI",
        userId: admin.id,
        keterangan: `Pembayaran hutang untuk ${pengadaanKredit.nomor}`,
      });
    } catch (e) {
      console.warn("Lewati contoh hutang seed:", (e as Error).message);
    }
  }

  console.log("Seed selesai.");
  console.log(`Perusahaan demo: ${company.nama} (slug: ${company.slug})`);
  console.log("Login demo:");
  console.log("  admin@toko.com   / password123 (ADMIN)");
  console.log("  manager@toko.com / password123 (MANAGER)");
  console.log("  staff@toko.com   / password123 (STAFF)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
