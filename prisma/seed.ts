import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      { name: "Administrator", email: "admin@toko.com", password, role: "ADMIN" },
      { name: "Manajer Gudang", email: "manager@toko.com", password, role: "MANAGER" },
      { name: "Staff Gudang", email: "staff@toko.com", password, role: "STAFF" },
    ],
    skipDuplicates: true,
  });

  const kategoriData = ["Elektronik", "Alat Tulis Kantor", "Bahan Baku", "Aksesoris"];
  for (const nama of kategoriData) {
    await prisma.kategori.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
  }
  const kategoris = await prisma.kategori.findMany();

  const supplier = await prisma.supplier.create({
    data: { nama: "PT Sumber Makmur", alamat: "Jl. Industri No. 10, Jakarta", telepon: "021-5551234", email: "sales@sumbermakmur.co.id" },
  });

  const pelanggan = await prisma.pelanggan.create({
    data: { nama: "Toko Berkah Jaya", alamat: "Jl. Merdeka No. 5, Bogor", telepon: "0251-4441234" },
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
      where: { kode: b.kode },
      update: {},
      create: {
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
  const allBarang = await prisma.barang.findMany();

  if (admin && allBarang.length > 0) {
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const tanggal = new Date(now.getFullYear(), now.getMonth() - i, 12);
      const b1 = allBarang[i % allBarang.length];
      const qty1 = 5 + i;
      const total1 = Number(b1.hargaJual) * qty1;

      await prisma.penjualan.create({
        data: {
          nomor: `PJ-${tanggal.getFullYear()}${String(tanggal.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
          tanggal,
          pelangganId: pelanggan.id,
          userId: admin.id,
          total: total1,
          detail: {
            create: [
              {
                barangId: b1.id,
                qty: qty1,
                hargaSatuan: b1.hargaJual,
                subtotal: total1,
              },
            ],
          },
        },
      });

      const b2 = allBarang[(i + 2) % allBarang.length];
      const qty2 = 10 + i * 2;
      const total2 = Number(b2.hargaBeli) * qty2;
      await prisma.pengadaan.create({
        data: {
          nomor: `PO-${tanggal.getFullYear()}${String(tanggal.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
          tanggal,
          supplierId: supplier.id,
          userId: admin.id,
          total: total2,
          detail: {
            create: [
              {
                barangId: b2.id,
                qty: qty2,
                hargaSatuan: b2.hargaBeli,
                subtotal: total2,
              },
            ],
          },
        },
      });
    }
  }

  console.log("Seed selesai.");
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
