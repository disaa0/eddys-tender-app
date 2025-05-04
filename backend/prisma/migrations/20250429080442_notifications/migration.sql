-- CreateTable
CREATE TABLE `notificationToken` (
    `idNotificationToken` INTEGER NOT NULL AUTO_INCREMENT,
    `idUser` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `deviceInfo` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastUsed` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `notificationToken_token_key`(`token`),
    PRIMARY KEY (`idNotificationToken`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notificationToken` ADD CONSTRAINT `notificationToken_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;
