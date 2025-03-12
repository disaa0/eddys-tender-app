const { addShippingAddress, getShippingAddress } = require("../services/shippingAddress.service.js");

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

module.exports = {
    createShippingAddress, getUserShippingAddress
};