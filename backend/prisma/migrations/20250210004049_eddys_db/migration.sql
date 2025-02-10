-- CreateTable
CREATE TABLE `user` (
    `idUser` INTEGER NOT NULL AUTO_INCREMENT,
    `idUserType` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userType` (
    `idUserType` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idUserType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userInformation` (
    `idUserInformation` INTEGER NOT NULL AUTO_INCREMENT,
    `idUser` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `secondLastName` VARCHAR(191) NULL,
    `phone` VARCHAR(10) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `userInformation_idUser_key`(`idUser`),
    PRIMARY KEY (`idUserInformation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location` (
    `idLocation` INTEGER NOT NULL AUTO_INCREMENT,
    `idUserInformation` INTEGER NOT NULL,
    `street` VARCHAR(100) NOT NULL,
    `houseNumber` VARCHAR(10) NOT NULL,
    `postalCode` VARCHAR(5) NOT NULL,
    `neighborhood` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`idLocation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `idProduct` INTEGER NOT NULL AUTO_INCREMENT,
    `idProductType` INTEGER NOT NULL,
    `idUserAdded` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idProduct`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productType` (
    `idProductType` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idProductType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart` (
    `idCart` INTEGER NOT NULL AUTO_INCREMENT,
    `idUser` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idCart`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itemCart` (
    `idItemCart` INTEGER NOT NULL AUTO_INCREMENT,
    `idCart` INTEGER NOT NULL,
    `idProduct` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL,

    PRIMARY KEY (`idItemCart`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personalization` (
    `idPersonalization` INTEGER NOT NULL AUTO_INCREMENT,
    `idUserAdded` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idPersonalization`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productPersonalization` (
    `idProductPersonalization` INTEGER NOT NULL AUTO_INCREMENT,
    `idUserAdded` INTEGER NOT NULL,
    `idProduct` INTEGER NOT NULL,
    `idPersonalization` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL,

    PRIMARY KEY (`idProductPersonalization`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userProductPersonalize` (
    `idUserProductPersonalize` INTEGER NOT NULL AUTO_INCREMENT,
    `idItemCart` INTEGER NOT NULL,
    `idProductPersonalization` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL,

    PRIMARY KEY (`idUserProductPersonalize`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipmentType` (
    `idShipmentType` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idShipmentType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paymentType` (
    `idPaymentType` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idPaymentType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderStatus` (
    `idOrderStatus` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idOrderStatus`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `idOrder` INTEGER NOT NULL AUTO_INCREMENT,
    `idCart` INTEGER NOT NULL,
    `idPaymentType` INTEGER NOT NULL,
    `idShipmentType` INTEGER NOT NULL,
    `idOrderStatus` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deliveryAt` DATETIME(3) NULL,
    `totalPrice` DOUBLE NOT NULL,

    PRIMARY KEY (`idOrder`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `idNotification` INTEGER NOT NULL AUTO_INCREMENT,
    `idOrder` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`idNotification`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_idUserType_fkey` FOREIGN KEY (`idUserType`) REFERENCES `userType`(`idUserType`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userInformation` ADD CONSTRAINT `userInformation_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_idUserInformation_fkey` FOREIGN KEY (`idUserInformation`) REFERENCES `userInformation`(`idUserInformation`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_idProductType_fkey` FOREIGN KEY (`idProductType`) REFERENCES `productType`(`idProductType`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_idUserAdded_fkey` FOREIGN KEY (`idUserAdded`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itemCart` ADD CONSTRAINT `itemCart_idCart_fkey` FOREIGN KEY (`idCart`) REFERENCES `cart`(`idCart`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itemCart` ADD CONSTRAINT `itemCart_idProduct_fkey` FOREIGN KEY (`idProduct`) REFERENCES `product`(`idProduct`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personalization` ADD CONSTRAINT `personalization_idUserAdded_fkey` FOREIGN KEY (`idUserAdded`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productPersonalization` ADD CONSTRAINT `productPersonalization_idUserAdded_fkey` FOREIGN KEY (`idUserAdded`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productPersonalization` ADD CONSTRAINT `productPersonalization_idProduct_fkey` FOREIGN KEY (`idProduct`) REFERENCES `product`(`idProduct`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productPersonalization` ADD CONSTRAINT `productPersonalization_idPersonalization_fkey` FOREIGN KEY (`idPersonalization`) REFERENCES `personalization`(`idPersonalization`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userProductPersonalize` ADD CONSTRAINT `userProductPersonalize_idItemCart_fkey` FOREIGN KEY (`idItemCart`) REFERENCES `itemCart`(`idItemCart`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userProductPersonalize` ADD CONSTRAINT `userProductPersonalize_idProductPersonalization_fkey` FOREIGN KEY (`idProductPersonalization`) REFERENCES `productPersonalization`(`idProductPersonalization`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_idCart_fkey` FOREIGN KEY (`idCart`) REFERENCES `cart`(`idCart`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_idPaymentType_fkey` FOREIGN KEY (`idPaymentType`) REFERENCES `paymentType`(`idPaymentType`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_idShipmentType_fkey` FOREIGN KEY (`idShipmentType`) REFERENCES `shipmentType`(`idShipmentType`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_idOrderStatus_fkey` FOREIGN KEY (`idOrderStatus`) REFERENCES `orderStatus`(`idOrderStatus`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_idOrder_fkey` FOREIGN KEY (`idOrder`) REFERENCES `order`(`idOrder`) ON DELETE RESTRICT ON UPDATE CASCADE;
