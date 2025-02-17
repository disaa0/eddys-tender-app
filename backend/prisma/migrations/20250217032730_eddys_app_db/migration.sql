/*
  Warnings:

  - You are about to drop the column `amount` on the `itemcart` table. All the data in the column will be lost.
  - Added the required column `individualPrice` to the `itemCart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `itemCart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `itemcart` DROP COLUMN `amount`,
    ADD COLUMN `individualPrice` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL;
