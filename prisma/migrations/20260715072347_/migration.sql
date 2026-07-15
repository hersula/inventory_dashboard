-- AlterTable
ALTER TABLE `pengadaan` ADD COLUMN `metodeBayar` ENUM('TUNAI', 'TRANSFER', 'KREDIT', 'TEMPO') NOT NULL DEFAULT 'TUNAI';

-- AlterTable
ALTER TABLE `penjualan` ADD COLUMN `metodeBayar` ENUM('TUNAI', 'TRANSFER', 'KREDIT', 'TEMPO') NOT NULL DEFAULT 'TUNAI';

-- CreateTable
CREATE TABLE `pembayaran` (
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

    INDEX `Pembayaran_companyId_idx`(`companyId`),
    INDEX `Pembayaran_referensiTipe_referensiId_idx`(`referensiTipe`, `referensiId`),
    INDEX `Pembayaran_userId_fkey`(`userId`),
    UNIQUE INDEX `Pembayaran_companyId_nomor_key`(`companyId`, `nomor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pembayaran` ADD CONSTRAINT `Pembayaran_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembayaran` ADD CONSTRAINT `Pembayaran_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
