/*
  Warnings:

  - You are about to drop the column `isActive` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Company` DROP COLUMN `isActive`,
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `planId` INTEGER NULL,
    ADD COLUMN `rejectedReason` TEXT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `subscriptionEndsAt` DATETIME(3) NULL,
    ADD COLUMN `subscriptionStatus` ENUM('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELED') NOT NULL DEFAULT 'TRIAL';

-- CreateTable
CREATE TABLE `SuperAdmin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SuperAdmin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscriptionPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `harga` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `billingCycle` ENUM('MONTHLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
    `maxUser` INTEGER NULL,
    `maxBarang` INTEGER NULL,
    `deskripsi` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SubscriptionPlan_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Company_planId_idx` ON `Company`(`planId`);

-- CreateIndex
CREATE INDEX `Company_status_idx` ON `Company`(`status`);

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `Company_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
