
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
        where: { idUserInformation: userId }
    });

    if (!user) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    // Crear la dirección en la base de datos
    return prisma.location.create({
        data: {
            idUserInformation: user.idUserInformation,
            street: addressData.street,
            houseNumber: addressData.houseNumber,
            postalCode: addressData.postalCode,
            neighborhood: addressData.neighborhood,
            status: true // Se crea como activa por defecto
        }
    });
}

async function getShippingAddresses(userId) {
    const user = await prisma.userInformation.findFirst({
        where: { idUserInformation: userId }
    });

    if (!user) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    // Find all active addresses for this user
    const addresses = await prisma.location.findMany({
        where: {
            idUserInformation: user.idUserInformation,
            status: true
        }
    });

    return addresses;
}

async function getAllShippingAddressesForUser(userId) {
    const user = await prisma.userInformation.findFirst({
        where: { idUserInformation: userId }
    });

    if (!user) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    // Find all  addresses for this user
    const addresses = await prisma.location.findMany({
        where: {
            idUserInformation: user.idUserInformation,
        }
    });

    return addresses;
}

async function getLastShippingAddress(userId) {
    const user = await prisma.userInformation.findFirst({
        where: { idUserInformation: userId }
    });

    if (!user) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    // Find the last active address for this user
    const address = await prisma.location.findFirst({
        where: {
            idUserInformation: user.idUserInformation,
        },
        orderBy: {
            idLocation: 'desc'
        }
    });

    if (!address || address.length === 0) {
        throw new Error("No se encontró dirección registrada para este usuario");
    }


    return address;
}

// Keep the single address getter for backward compatibility
async function getShippingAddress(userId) {
    const addresses = await getShippingAddresses(userId);

    if (!addresses || addresses.length === 0) {
        throw new Error("No se encontró dirección activa para este usuario.");
    }

    // Return the first active address
    return addresses[0];
}

async function updateAddress(userId, addressId, addressData) {
    // Verificar si el usuario existe y está activo
    const user = await prisma.userInformation.findFirst({
        where: { idUserInformation: userId }
    });

    if (!user) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    // Buscar la dirección específica
    const address = await prisma.location.findUnique({
        where: { idLocation: addressId }
    });

    if (!address) {
        throw new Error("Dirección no encontrada");
    }

    // Verificar que la dirección pertenezca al usuario
    if (address.idUserInformation !== user.idUserInformation) {
        throw new Error("No tienes permiso para modificar esta dirección");
    }

    // Actualizar la dirección
    return prisma.location.update({
        where: { idLocation: addressId },
        data: {
            street: addressData.street,
            houseNumber: addressData.houseNumber,
            postalCode: addressData.postalCode,
            neighborhood: addressData.neighborhood
        }
    });
}

async function deleteAddress(userId, addressId) {
    // Verificar si el usuario existe y está activo
    const user = await prisma.userInformation.findFirst({
        where: { idUserInformation: userId }
    });

    if (!user) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    // Buscar la dirección específica
    const address = await prisma.location.findUnique({
        where: { idLocation: addressId }
    });

    if (!address) {
        throw new Error("Dirección no encontrada");
    }

    // Verificar que la dirección pertenezca al usuario
    if (address.idUserInformation !== user.idUserInformation) {
        throw new Error("No tienes permiso para eliminar esta dirección");
    }

    // Realizar borrado lógico (soft delete)
    return prisma.location.update({
        where: { idLocation: addressId },
        data: { status: false }
    });
}

async function getShippingAddressById(userId, addressId) {
    const user = await prisma.userInformation.findFirst({
        where: { idUserInformation: userId }
    });

    if (!user) {
        throw new Error("Usuario no autorizado o inactivo.");
    }

    // Only return address if it belongs to the user
    const address = await prisma.location.findFirst({
        where: {
            idLocation: addressId,
            idUserInformation: user.idUserInformation,
            status: true
        }
    });

    if (!address) {
        throw new Error("Dirección no encontrada o no autorizada.");
    }

    return address;
}

module.exports = {
    addShippingAddress,
    getShippingAddress,
    getShippingAddresses,
    updateAddress,
    deleteAddress,
    getShippingAddressById,
    getLastShippingAddress,
    getAllShippingAddressesForUser
};

