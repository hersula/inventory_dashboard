/*
  Warnings:

  - You are about to drop the column `harga` on the `detailretur` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah` on the `detailretur` table. All the data in the column will be lost.
  - You are about to drop the column `nomorRetur` on the `retur` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `retur` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `retur` table. All the data in the column will be lost.
  - You are about to alter the column `jenis` on the `retur` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(10))`.
  - You are about to alter the column `total` on the `retur` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(15,2)`.
  - A unique constraint covering the columns `[companyId,nomor]` on the table `Retur` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hargaSatuan` to the `DetailRetur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `DetailRetur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `DetailRetur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomor` to the `Retur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referensiId` to the `Retur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referensiTipe` to the `Retur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Retur` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DetailRetur` DROP FOREIGN KEY `DetailRetur_returId_fkey`;

-- DropForeignKey
ALTER TABLE `Retur` DROP FOREIGN KEY `Retur_companyId_fkey`;

-- DropIndex
DROP INDEX `Retur_nomorRetur_key` ON `Retur`;

-- AlterTable
ALTER TABLE `DetailRetur` DROP COLUMN `harga`,
    DROP COLUMN `jumlah`,
    ADD COLUMN `hargaSatuan` DECIMAL(15, 2) NOT NULL,
    ADD COLUMN `qty` INTEGER NOT NULL,
    ADD COLUMN `subtotal` DECIMAL(15, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Retur` DROP COLUMN `nomorRetur`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `catatan` VARCHAR(191) NULL,
    ADD COLUMN `nomor` VARCHAR(191) NOT NULL,
    ADD COLUMN `referensiId` INTEGER NOT NULL,
    ADD COLUMN `referensiTipe` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `jenis` ENUM('PEMBELIAN', 'PENJUALAN') NOT NULL,
    MODIFY `total` DECIMAL(15, 2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Retur_referensiTipe_referensiId_idx` ON `Retur`(`referensiTipe`, `referensiId`);

-- CreateIndex
CREATE INDEX `Retur_userId_idx` ON `Retur`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Retur_companyId_nomor_key` ON `Retur`(`companyId`, `nomor`);

-- AddForeignKey
ALTER TABLE `Retur` ADD CONSTRAINT `Retur_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Retur` ADD CONSTRAINT `Retur_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailRetur` ADD CONSTRAINT `DetailRetur_returId_fkey` FOREIGN KEY (`returId`) REFERENCES `Retur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `DetailRetur_barangId_idx` ON `DetailRetur`(`barangId`);
-- DROP INDEX `DetailRetur_barangId_fkey` ON `detailretur`;
