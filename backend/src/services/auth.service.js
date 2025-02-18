const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt.config');
//const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

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

module.exports = {
    registerUser,
    loginUser,
};
