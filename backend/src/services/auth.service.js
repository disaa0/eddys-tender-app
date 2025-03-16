const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require("../config/bcrypt.config");
const { encrypt, decrypt } = require('../config/crypto.config');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt.config');

const prisma = new PrismaClient();

async function registerUserService(email, password, username, name, lastName, secondLastName, phone, idUserType) {
    return await prisma.$transaction(async (tx) => {

        const existingEmail = await tx.user.findFirst({
            where: {
                email: email,
                status: true
            }
        });
        if (existingEmail) {
            throw new Error('Email ya registrado');
        }

        const existingUsername = await tx.user.findFirst({
            where: {
                username: username,
                status: true
            },
        });

        if (existingUsername) {
            throw new Error('Nombre de usuario ya existente');
        }

        const hashedPassword = await hashPassword(password);
        const user = await tx.user.create({
            data: {
                email: email,
                //YA HASHEADO... password: bcrypt.hashSync(password, 10), // Encriptar contraseña con bcrypt
                password: hashedPassword, // Encriptar contraseña con bcrypt aplicable a producción
                username: username,
                status: true,
                idUserType: idUserType,//Para registro de usuarios clientes
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

    // First check if user exists at all (regardless of status)
    const userExists = await prisma.user.findFirst({
        where: {
            OR: Object.keys(whereCondition).map((key) => ({ [key]: whereCondition[key] }))
        }
    });

    if (!userExists) {
        throw new Error('Usuario no encontrado');
    }

    // Then check if user is active
    if (!userExists.status) {
        throw new Error('Cuenta desactivada');
    }

    // Check password without encryption
    // if (password !== userExists.password) {
    //     throw new Error('Contraseña incorrecta');
    // }

    // Check password with encryption, available in production. not require changes in development.
    if (!await comparePassword(password, userExists.password)) {
        throw new Error('Contraseña incorrecta');
    }

    // Generate token
    const token = jwt.sign(
        {
            userId: userExists.idUser,
            email: userExists.email,
            username: userExists.username,
            userType: userExists.idUserType
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = userExists;
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
            data: {
                status: false,
                updatedAt: new Date()
            }
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

        // Invalidate any active sessions/tokens
        // Note: This is handled by the auth middleware checking user status

        return {
            message: 'Cuenta desactivada exitosamente',
            details: 'Tu cuenta y datos asociados han sido desactivados'
        };
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
        // if (oldPassword !== user.password) {
        //     throw new Error('Contraseña actual incorrecta');
        // }


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

        // Comparación de contraseñas usando bcrypt en producción
        if (!await comparePassword(oldPassword, user.password)) {
            throw new Error('Contraseña actual incorrecta');
        }

        const hashedNewPassword = await hashPassword(newPassword);

        // DESARROLLO: Actualizar contraseña sin encriptar
        // await prisma.user.update({
        //     where: { idUser: userId },
        //     data: {
        //         password: newPassword,
        //         updatedAt: new Date()
        //     }
        // });

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

        // Actualizar contraseña con bcrypt en producción
        await prisma.user.update({
            where: { idUser: userId },
            data: {
                password: hashedNewPassword,
                updatedAt: new Date()
            }
        });

        return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
        throw error;
    }
}

async function updateEmail(userId, email) {
    try {
        // Validate if email already exists
        const existingUser = await prisma.user.findFirst({
            where: { email, status: true }
        });

        if (existingUser && existingUser.idUser !== userId) {
            throw new Error('Este correo electrónico ya está en uso');
        }

        // Update email
        const updatedUser = await prisma.user.update({
            where: { idUser: userId },
            data: { email },
            select: {
                idUser: true,
                email: true,
                username: true,
                status: true,
                idUserType: true
            }
        });

        return updatedUser;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    registerUserService,
    loginUser,
    deleteUserProfile,
    updatePassword,
    updateEmail
};
