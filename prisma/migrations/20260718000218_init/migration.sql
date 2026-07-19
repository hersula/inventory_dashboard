-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `telepon` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Company_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MANAGER', 'STAFF') NOT NULL DEFAULT 'STAFF',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kategori` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Kategori_companyId_nama_key`(`companyId`, `nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `telepon` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,

    INDEX `Supplier_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pelanggan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `telepon` VARCHAR(191) NULL,

    INDEX `Pelanggan_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Barang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kategoriId` INTEGER NULL,
    `satuan` VARCHAR(191) NOT NULL DEFAULT 'pcs',
    `hargaBeli` DECIMAL(15, 2) NOT NULL,
    `hargaJual` DECIMAL(15, 2) NOT NULL,
    `stok` INTEGER NOT NULL DEFAULT 0,
    `stokMinimum` INTEGER NOT NULL DEFAULT 5,
    `deskripsi` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Barang_kategoriId_idx`(`kategoriId`),
    UNIQUE INDEX `Barang_companyId_kode_key`(`companyId`, `kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pengadaan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `nomor` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `supplierId` INTEGER NULL,
    `userId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SELESAI',
    `catatan` VARCHAR(191) NULL,
    `metodeBayar` ENUM('TUNAI', 'TRANSFER', 'KREDIT', 'TEMPO') NOT NULL DEFAULT 'TUNAI',
    `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `diskonPersen` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `diskonNominal` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `ppn` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Pengadaan_supplierId_idx`(`supplierId`),
    INDEX `Pengadaan_userId_idx`(`userId`),
    UNIQUE INDEX `Pengadaan_companyId_nomor_key`(`companyId`, `nomor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PengadaanDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pengadaanId` INTEGER NOT NULL,
    `barangId` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `hargaSatuan` DECIMAL(15, 2) NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,

    INDEX `PengadaanDetail_pengadaanId_idx`(`pengadaanId`),
    INDEX `PengadaanDetail_barangId_idx`(`barangId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Penjualan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `nomor` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pelangganId` INTEGER NULL,
    `userId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SELESAI',
    `catatan` VARCHAR(191) NULL,
    `metodeBayar` ENUM('TUNAI', 'TRANSFER', 'KREDIT', 'TEMPO') NOT NULL DEFAULT 'TUNAI',
    `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `diskonPersen` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `diskonNominal` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `ppn` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Penjualan_pelangganId_idx`(`pelangganId`),
    INDEX `Penjualan_userId_idx`(`userId`),
    UNIQUE INDEX `Penjualan_companyId_nomor_key`(`companyId`, `nomor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PenjualanDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `penjualanId` INTEGER NOT NULL,
    `barangId` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `hargaSatuan` DECIMAL(15, 2) NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,

    INDEX `PenjualanDetail_penjualanId_idx`(`penjualanId`),
    INDEX `PenjualanDetail_barangId_idx`(`barangId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Akun` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tipe` ENUM('ASET', 'KEWAJIBAN', 'MODAL', 'PENDAPATAN', 'BEBAN') NOT NULL,
    `saldoNormal` ENUM('DEBIT', 'KREDIT') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Akun_tipe_idx`(`tipe`),
    UNIQUE INDEX `Akun_companyId_kode_key`(`companyId`, `kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JurnalEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `nomor` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `keterangan` VARCHAR(191) NULL,
    `referensiTipe` VARCHAR(191) NOT NULL DEFAULT 'manual',
    `referensiId` INTEGER NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JurnalEntry_tanggal_idx`(`tanggal`),
    INDEX `JurnalEntry_referensiTipe_referensiId_idx`(`referensiTipe`, `referensiId`),
    UNIQUE INDEX `JurnalEntry_companyId_nomor_key`(`companyId`, `nomor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JurnalDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jurnalEntryId` INTEGER NOT NULL,
    `akunId` INTEGER NOT NULL,
    `debit` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `kredit` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `keterangan` VARCHAR(191) NULL,

    INDEX `JurnalDetail_jurnalEntryId_idx`(`jurnalEntryId`),
    INDEX `JurnalDetail_akunId_idx`(`akunId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pembayaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `nomor` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipe` ENUM('HUTANG', 'PIUTANG') NOT NULL,
    `referensiTipe` VARCHAR(191) NOT NULL,
    `referensiId` INTEGER NOT NULL,
    `jumlah` DECIMAL(15, 2) NOT NULL,
    `metodeBayar` ENUM('TUNAI', 'TRANSFER') NOT NULL DEFAULT 'TUNAI',
    `keterangan` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Pembayaran_referensiTipe_referensiId_idx`(`referensiTipe`, `referensiId`),
    INDEX `Pembayaran_companyId_idx`(`companyId`),
    UNIQUE INDEX `Pembayaran_companyId_nomor_key`(`companyId`, `nomor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kategori` ADD CONSTRAINT `Kategori_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelanggan` ADD CONSTRAINT `Pelanggan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_kategoriId_fkey` FOREIGN KEY (`kategoriId`) REFERENCES `Kategori`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengadaan` ADD CONSTRAINT `Pengadaan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengadaan` ADD CONSTRAINT `Pengadaan_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengadaan` ADD CONSTRAINT `Pengadaan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengadaanDetail` ADD CONSTRAINT `PengadaanDetail_pengadaanId_fkey` FOREIGN KEY (`pengadaanId`) REFERENCES `Pengadaan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PengadaanDetail` ADD CONSTRAINT `PengadaanDetail_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Penjualan` ADD CONSTRAINT `Penjualan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Penjualan` ADD CONSTRAINT `Penjualan_pelangganId_fkey` FOREIGN KEY (`pelangganId`) REFERENCES `Pelanggan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Penjualan` ADD CONSTRAINT `Penjualan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenjualanDetail` ADD CONSTRAINT `PenjualanDetail_penjualanId_fkey` FOREIGN KEY (`penjualanId`) REFERENCES `Penjualan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenjualanDetail` ADD CONSTRAINT `PenjualanDetail_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Akun` ADD CONSTRAINT `Akun_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JurnalEntry` ADD CONSTRAINT `JurnalEntry_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JurnalEntry` ADD CONSTRAINT `JurnalEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JurnalDetail` ADD CONSTRAINT `JurnalDetail_jurnalEntryId_fkey` FOREIGN KEY (`jurnalEntryId`) REFERENCES `JurnalEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JurnalDetail` ADD CONSTRAINT `JurnalDetail_akunId_fkey` FOREIGN KEY (`akunId`) REFERENCES `Akun`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembayaran` ADD CONSTRAINT `Pembayaran_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembayaran` ADD CONSTRAINT `Pembayaran_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
