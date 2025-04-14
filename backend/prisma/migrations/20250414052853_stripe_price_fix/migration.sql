/*
  Warnings:

  - You are about to alter the column `individualPrice` on the `itemCart` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `itemCart` MODIFY `individualPrice` DOUBLE NOT NULL;
