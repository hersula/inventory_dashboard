-- CreateTable
CREATE TABLE `Retur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomorRetur` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `jenis` VARCHAR(191) NOT NULL,
    `total` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `companyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Retur_nomorRetur_key`(`nomorRetur`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailRetur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `returId` INTEGER NOT NULL,
    `barangId` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `harga` DECIMAL(15, 2) NOT NULL,

    UNIQUE INDEX `DetailRetur_returId_barangId_key`(`returId`, `barangId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Retur` ADD CONSTRAINT `Retur_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailRetur` ADD CONSTRAINT `DetailRetur_returId_fkey` FOREIGN KEY (`returId`) REFERENCES `Retur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailRetur` ADD CONSTRAINT `DetailRetur_barangId_fkey` FOREIGN KEY (`barangId`) REFERENCES `Barang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
