/*
  Warnings:

  - A unique constraint covering the columns `[companyId,kode]` on the table `Akun` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,kode]` on the table `Barang` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,nomor]` on the table `JurnalEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,nama]` on the table `Kategori` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,nomor]` on the table `Pengadaan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,nomor]` on the table `Penjualan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Akun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Barang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `JurnalEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Kategori` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Pelanggan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Pengadaan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Penjualan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Akun_kode_key` ON `Akun`;

-- DropIndex
DROP INDEX `Barang_kode_key` ON `Barang`;

-- DropIndex
DROP INDEX `JurnalEntry_nomor_key` ON `JurnalEntry`;

-- DropIndex
DROP INDEX `Kategori_nama_key` ON `Kategori`;

-- DropIndex
DROP INDEX `Pengadaan_nomor_key` ON `Pengadaan`;

-- DropIndex
DROP INDEX `Penjualan_nomor_key` ON `Penjualan`;

-- AlterTable
ALTER TABLE `Akun` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Barang` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `JurnalEntry` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Kategori` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Pelanggan` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Pengadaan` ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `diskonNominal` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `diskonPersen` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `ppn` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Penjualan` ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `diskonNominal` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `diskonPersen` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `ppn` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Supplier` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `companyId` INTEGER NOT NULL;

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

-- CreateIndex
CREATE UNIQUE INDEX `Akun_companyId_kode_key` ON `Akun`(`companyId`, `kode`);

-- CreateIndex
CREATE UNIQUE INDEX `Barang_companyId_kode_key` ON `Barang`(`companyId`, `kode`);

-- CreateIndex
CREATE UNIQUE INDEX `JurnalEntry_companyId_nomor_key` ON `JurnalEntry`(`companyId`, `nomor`);

-- CreateIndex
CREATE UNIQUE INDEX `Kategori_companyId_nama_key` ON `Kategori`(`companyId`, `nama`);

-- CreateIndex
CREATE INDEX `Pelanggan_companyId_idx` ON `Pelanggan`(`companyId`);

-- CreateIndex
CREATE UNIQUE INDEX `Pengadaan_companyId_nomor_key` ON `Pengadaan`(`companyId`, `nomor`);

-- CreateIndex
CREATE UNIQUE INDEX `Penjualan_companyId_nomor_key` ON `Penjualan`(`companyId`, `nomor`);

-- CreateIndex
CREATE INDEX `Supplier_companyId_idx` ON `Supplier`(`companyId`);

-- CreateIndex
CREATE INDEX `User_companyId_idx` ON `User`(`companyId`);

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
ALTER TABLE `Pengadaan` ADD CONSTRAINT `Pengadaan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Penjualan` ADD CONSTRAINT `Penjualan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Akun` ADD CONSTRAINT `Akun_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JurnalEntry` ADD CONSTRAINT `JurnalEntry_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
