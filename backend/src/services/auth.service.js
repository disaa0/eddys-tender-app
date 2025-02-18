const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../config/crypto.config');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt.config');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function registerUser(email, password, username, name, lastName, secondLastName, phone, /*idUserType*/) {
    return await prisma.$transaction(async (tx) => {

        const existingEmail = await tx.user.findUnique({
            where: {
                email: email,
            },
        });
        if (existingEmail) {
            throw new Error('Email ya existente');
        }

        const existingUsername = await tx.user.findUnique({
            where: {
                username: username,
            },
        });
        if (existingUsername) {
            throw new Error('Nombre de usuario ya existente');
        }

        const user = await tx.user.create({
            data: {
                email: email,
                //password: bcrypt.hashSync(password, 10), // Encriptar contraseña con bcrypt
                password: password,
                username: username,
                status: true,
                idUserType: 1,//De momento solo registra usuarios normales, una vez se implemente el sistema de roles y JWT se cambiara
            },
        });

        await tx.userInformation.create({
            data: {
                idUser: user.idUser,
                name: name,
                lastName: lastName,
                secondLastName: secondLastName,
                phone: phone,
            },
        });

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;

    });
}

async function loginUser(email, username, password) {
    const whereCondition = {};

    if (email) whereCondition.email = email;
    if (username) whereCondition.username = username;

    const user = await prisma.user.findFirst({
        where: {
            OR: Object.keys(whereCondition).map((key) => ({ [key]: whereCondition[key] }))
        }
    });

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    // Comparar contraseñas con bcrypt

    // if (!bcrypt.compareSync(password, user.password)) {
    //     throw new Error('Contraseña incorrecta');
    // }

    if (password !== user.password) {
        throw new Error('Contraseña incorrecta');
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            userId: user.idUser,
            email: user.email,
            username: user.username,
            userType: user.idUserType
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        token
    };
}

async function deleteUserProfile(userId) {
    return await prisma.$transaction(async (tx) => {
        // Soft delete del usuario
        const user = await tx.user.update({
            where: { idUser: userId },
            data: { status: false }
        });

        // Soft delete de la información asociada
        await tx.userInformation.update({
            where: { idUser: userId },
            data: {
                locations: {
                    updateMany: {
                        where: { status: true },
                        data: { status: false }
                    }
                }
            },
            include: { locations: true }
        });

        // Soft delete de carritos activos
        await tx.cart.updateMany({
            where: {
                idUser: userId,
                status: true
            },
            data: { status: false }
        });

        return { message: 'Cuenta desactivada exitosamente' };
    });
}

async function updatePassword(userId, oldPassword, newPassword) {
    try {
        const user = await prisma.user.findUnique({
            where: { idUser: userId }
        });

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // DESARROLLO: Comparación directa de contraseñas
        if (oldPassword !== user.password) {
            throw new Error('Contraseña actual incorrecta');
        }

        /* PRODUCCIÓN: Descomentar para usar bcrypt + encryption
        let decryptedOldPassword;
        try {
            decryptedOldPassword = decrypt(oldPassword);
        } catch (error) {
            throw new Error('Error al procesar la contraseña actual');
        }

        const validPassword = await bcrypt.compare(decryptedOldPassword, user.password);
        if (!validPassword) {
            throw new Error('Contraseña actual incorrecta');
        }
        */

        // DESARROLLO: Actualizar contraseña sin encriptar
        await prisma.user.update({
            where: { idUser: userId },
            data: {
                password: newPassword,
                updatedAt: new Date()
            }
        });

        /* PRODUCCIÓN: Descomentar para usar bcrypt + encryption
        let encryptedNewPassword;
        try {
            encryptedNewPassword = encrypt(newPassword);
            const hashedPassword = await bcrypt.hash(encryptedNewPassword, SALT_ROUNDS);
            await prisma.user.update({
                where: { idUser: userId },
                data: {
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            });
        } catch (error) {
            throw new Error('Error al procesar la nueva contraseña');
        }
        */

        return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    registerUser,
    loginUser,
    deleteUserProfile,
    updatePassword
};
