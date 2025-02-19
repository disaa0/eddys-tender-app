const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function getUserById(idUser) {
    try {

        if (!idUser) {
            throw new Error("El ID del usuario no puede ser undefined o null");
        }

        const user = await prisma.user.findUnique({
            where: { idUser: idUser },
            include: {
                userInformation: true
            }
        });

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    catch (error) {
        throw error;
    }
}



module.exports = { getUserById };