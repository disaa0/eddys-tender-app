/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `user_email_key` ON `user`;

-- DropIndex
DROP INDEX `user_username_key` ON `user`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `stripeClientSecret` VARCHAR(191) NULL,
    ADD COLUMN `stripePaymentIntentId` VARCHAR(191) NULL,
    ADD COLUMN `stripePaymentStatus` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `order_stripePaymentIntentId_key` ON `order`(`stripePaymentIntentId`);
