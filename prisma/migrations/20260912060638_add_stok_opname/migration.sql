-- CreateTable
CREATE TABLE `StokOpname` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `nomor` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `catatan` VARCHAR(191) NULL,
    `totalNilaiSelisih` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StokOpname_companyId_idx`(`companyId`),
    INDEX `StokOpname_userId_idx`(`userId`),
    UNIQUE INDEX `StokOpname_companyId_nomor_key`(`companyId`, `nomor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StokOpnameDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stokOpnameId` INTEGER NOT NULL,
    `barangId` INTEGER NOT NULL,
    `stokSistem` INTEGER NOT NULL,
    `stokFisik` INTEGER NOT NULL,
    `selisih` INTEGER NOT NULL,
    `hargaBeli` DECIMAL(15, 2) NOT NULL,
    `nilaiSelisih` DECIMAL(15, 2) NOT NULL,

    INDEX `StokOpnameDetail_barangId_idx`(`barangId`),
    UNIQUE INDEX `StokOpnameDetail_stokOpnameId_barangId_key`(`stokOpnameId`, `barangId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StokOpname` ADD CONSTRAINT `StokOpname_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StokOpname` ADD CONSTRAINT `StokOpname_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StokOpnameDetail` ADD CONSTRAINT `StokOpnameDetail_stokOpnameId_fkey` FOREIGN KEY (`stokOpnameId`) REFERENCES `StokOpname`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StokOpnameDetail` ADD CONSTRAINT `StokOpnameDetail_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
