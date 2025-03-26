const { addShippingAddress, getShippingAddress, getShippingAddresses, updateAddress, deleteAddress, getShippingAddressById } = require("../services/shippingAddress.service.js");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createShippingAddress(req, res) {
    try {
        const userId = req.user.userId; // ID del usuario autenticado (extraído del token)
        const addressData = req.body; // Datos validados por el middleware de Zod

        const newAddress = await addShippingAddress(userId, addressData);
        res.status(201).json({ message: "Dirección añadida correctamente", data: newAddress });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getUserShippingAddress(req, res) {
    try {
        const userId = req.user.userId; // ID del usuario autenticado

        const address = await getShippingAddress(userId);
        res.status(200).json({ message: "Dirección obtenida correctamente", data: address });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getAllUserShippingAddresses(req, res) {
    try {
        const userId = req.user.userId; // ID del usuario autenticado

        const addresses = await getShippingAddresses(userId);
        res.status(200).json({
            message: "Direcciones obtenidas correctamente",
            data: addresses
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function updateShippingAddress(req, res) {
    try {
        const userId = req.user.userId; // ID del usuario autenticado
        const addressId = parseInt(req.params.id);
        const addressData = req.body; // Datos validados por el middleware

        const updatedAddress = await updateAddress(userId, addressId, addressData);
        res.status(200).json({
            message: "Dirección actualizada correctamente",
            data: updatedAddress
        });
    } catch (error) {
        if (error.message === "Dirección no encontrada" ||
            error.message === "No tienes permiso para modificar esta dirección") {
            return res.status(403).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
}

async function deleteShippingAddress(req, res) {
    try {
        const userId = req.user.userId; // ID del usuario autenticado
        const addressId = parseInt(req.params.id);

        await deleteAddress(userId, addressId);
        res.status(200).json({
            message: "Dirección eliminada correctamente"
        });
    } catch (error) {
        if (error.message === "Dirección no encontrada" ||
            error.message === "No tienes permiso para eliminar esta dirección") {
            return res.status(403).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
}

async function handleGetShippingAddressById(req, res) {
    try {
        const userId = req.user.userId;
        const userType = req.user.userType;
        const addressId = parseInt(req.params.id);

        if (!userId || isNaN(addressId)) {
            return res.status(400).json({ 
                error: "Invalid user ID or address ID" 
            });
        }

        // If user is not admin, verify they own the address
        if (userType !== 1) { // Regular user
            const address = await getShippingAddressById(userId, addressId);
            return res.status(200).json({ 
                message: "Dirección obtenida correctamente", 
                data: address 
            });
        } else {
            // For admin, get any address without user check
            const address = await prisma.location.findFirst({
                where: {
                    idLocation: addressId,
                    status: true
                }
            });

            if (!address) {
                return res.status(404).json({ 
                    error: "Dirección no encontrada" 
                });
            }

            return res.status(200).json({ 
                message: "Dirección obtenida correctamente", 
                data: address 
            });
        }
    } catch (error) {
        console.error('Error in getShippingAddressById:', error);
        return res.status(400).json({ error: error.message });
    }
}

module.exports = {
    createShippingAddress,
    getUserShippingAddress,
    getAllUserShippingAddresses,
    updateShippingAddress,
    deleteShippingAddress,
    handleGetShippingAddressById
};

