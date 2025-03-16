-- AlterTable
ALTER TABLE `order` ADD COLUMN `idLocation` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_idLocation_fkey` FOREIGN KEY (`idLocation`) REFERENCES `location`(`idLocation`) ON DELETE SET NULL ON UPDATE CASCADE;
