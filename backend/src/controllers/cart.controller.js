const { addItemToCartService, addOneItemToCartService, softDeleteItemFromCartService, getItemsCartService, getTotalAmountCartService, getItemsQuantityCartService } = require('../services/cart.service');

const addItemToCart = async (req, res) => {
    const { idProduct } = req.params;
    const { quantity } = req.body;
    const userId = req.user.userId; // Se obtiene del middleware de autenticación

    try {
        const result = await addItemToCartService(userId, idProduct, quantity);

        return res.status(201).json({
            message: result.updated ? "Cantidad del producto actualizada en el carrito" : "Producto agregado al carrito",
            cartId: result.cartId,
            item: result.item
        });
    } catch (error) {
        let status = 400;
        let message = error.message;

        // Customize error messages based on the error
        switch (error.message) {
            case 'Producto no encontrado':
                message = 'El producto no existe';
                break;
            case 'El producto está inactivo y no se puede agregar al carrito':
                status = 403;
                message = 'Esta producto ha sido desactivado.';
                break;
            case 'La cantidad debe ser mayor a 0':
                message = 'La cantidad de productos debe ser mayor a 0. Por favor, ingrese una cantidad valida para el producto';
                break;
            default:
                message = 'Error en la peticion';
        }

        return res.status(status).json({ message });

    }
};

const addOneItemToCart = async (req, res) => {
    const { idProduct } = req.params;
    const userId = req.user.userId; // Se obtiene del middleware de autenticación

    try {
        const result = await addOneItemToCartService(userId, idProduct);

        return res.status(200).json({
            message: "Cantidad del producto actualizada en el carrito",
            cartId: result.cartId,
            item: result.item
        });
    } catch (error) {
        let status = 400;
        let message = error.message;

        // Customize error messages based on the error
        switch (error.message) {
            case 'Producto no encontrado':
                status = 404;
                message = 'Producto no encontrado';
                break;
            case 'El producto esta inactivo y no se puede agregar al carrito':
                status = 403;
                message = 'El producto esta inactivo y no se puede agregar al carrito';
                break;
            case 'cantidad maxima alcanzada':
                status = 406;
                message = 'No se puede agregar más de 100 unidades del mismo producto';
                break;
            default:
                message = 'Error en la peticion';
        }
        return res.status(status).json({ message });
    }
}

const softDeleteItemFromCart = async (req, res) => {
    const { idProduct } = req.params;
    const userId = req.user.userId; // Obtenido del middleware de autenticación

    try {
        const result = await softDeleteItemFromCartService(userId, idProduct);

        return res.status(200).json({
            message: "Producto eliminado del carrito",
            cartId: result.cartId,
            item: result.item
        });

    } catch (error) {
        let status = 400;
        let message = error.message;

        // Customize error messages based on the error
        switch (error.message) {
            case 'No se encontró un carrito activo para el usuario.':
                message = 'No se encontró un carrito activo para el usuario.';
                break;
            case 'El producto no está en el carrito o ya ha sido eliminado.':
                status = 403;
                message = 'Este producto ya ha sido desactivado en el carrito o este no existe en carrito.';
                break;
            default:
                message = 'Error en la peticion';
        }
        return res.status(status).json({ message });
    }
};

const getItemsCart = async (req, res) => {
    const userId = req.user.userId; // Obtenido del middleware de autenticación

    try {
        const items = await getItemsCartService(userId);

        return res.status(200).json({ items });

    } catch (error) {
        return res.status(400).json({ message: error.message || "Error en la solicitud" });
    }
};

const getTotalAmountCart = async (req, res) => {
    const userId = req.user.userId; // Obtenido del middleware de autenticación

    try {
        const totalAmount = await getTotalAmountCartService(userId);

        return res.status(200).json({ totalAmount });

    } catch (error) {
        return res.status(400).json({ message: error.message || "Error en la solicitud" });
    }
};

const getItemsQuantityCart = async (req, res) => {
    const userId = req.user.userId; // Obtenido del middleware de autenticación

    try {
        const result = await getItemsQuantityCartService(userId);

        return res.status(200).json({ totalQuantity: result });

    } catch (error) {
        return res.status(400).json({ message: error.message || "Error en la solicitud" });
    }
};

module.exports = {
    addItemToCart, 
    addOneItemToCart, 
    softDeleteItemFromCart, 
    getItemsCart, 
    getTotalAmountCart,
    getItemsQuantityCart
};
