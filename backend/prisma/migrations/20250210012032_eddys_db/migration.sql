/*
  Warnings:

  - Added the required column `status` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paid` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `location` ADD COLUMN `status` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `paid` BOOLEAN NOT NULL,
    ADD COLUMN `paidAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `userinformation` MODIFY `updatedAt` DATETIME(3) NULL;
