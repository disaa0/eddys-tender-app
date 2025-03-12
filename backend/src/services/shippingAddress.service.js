const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addShippingAddress(userId, addressData) {
    // Verificar si el usuario está activo antes de permitir la inserción
    isActive = await prisma.user.findUnique({
        where: { idUser: userId, status: true }
    });

    if (!isActive) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    const user = await prisma.userInformation.findFirst({
        where: { idUserInformation: userId } // Cambiado a findFirst
    });

    if (!user) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    // Verificar si el usuario ya tiene una dirección activa
    const existingAddress = await prisma.location.findFirst({
        where: { idUserInformation: user.idUserInformation, status: true }
    });

    if (existingAddress) {
        throw new Error("El usuario ya tiene una dirección activa.");
    }
    // Crear la dirección en la base de datos
    return prisma.location.create({
        data: {
            idUserInformation: user.idUserInformation, // Se toma desde el objeto user
            street: addressData.street,
            houseNumber: addressData.houseNumber,
            postalCode: addressData.postalCode,
            neighborhood: addressData.neighborhood,
            status: true // Se crea como activa por defecto
        }
    });
}

async function getShippingAddress(userId) {

    const user = await prisma.userInformation.findFirst({
        where: { idUserInformation: userId }
    });

    if (!user) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    const address = await prisma.location.findFirst({
        where: { idUserInformation: user.idUserInformation, status: true }
    });

    if (!address) {
        throw new Error("No se encontró dirección activa para este usuario.");
    }

    return address;
}

module.exports = {
    addShippingAddress, getShippingAddress
};