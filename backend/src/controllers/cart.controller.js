const { addItemToCartService, addOneItemToCartService, softDeleteItemFromCartService, getItemsCartService, getTotalAmountCartService, getItemsQuantityCartService, disableCartService, getCartByIdService, getCartsByIdUserService, addItemToCartServicePersonalizations, getLastItemCartForProductService } = require('../services/cart.service');

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
            case 'El carrito no puede contener mas de 30 productos':
                status = 409;
                message = 'El carrito no puede contener mas de 30 productos';
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

const addItemToCartPersonalized = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { quantity, personalizations } = req.body;

        const response = await addItemToCartServicePersonalizations(
            userId,
            parseInt(id),
            quantity,
            personalizations || []
        );

        return res.status(201).json(response);
    } catch (error) {
        return res.status(400).json({ error: error.message });
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
                message = 'No se puede agregar más de 30 unidades del mismo producto';
                break;
            case 'El carrito no puede contener mas de 30 productos':
                status = 409;
                message = 'El carrito no puede contener mas de 30 productos';
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

const disableCart = async (req, res) => {
    const userId = req.user.userId; // Obtenido del middleware de autenticación

    try {
        const result = await disableCartService(userId);

        return res.status(200).json({
            message: "Carrito desactivado exitosamente",
            cartId: result.cartId,
            status: result.status
        });

    } catch (error) {
        let status = 400;
        let message = error.message;

        // Customize error messages based on the error
        if (error.message === 'No se encontró un carrito activo para el usuario.') {
            status = 404;
            message = 'No se encontró un carrito activo para el usuario.';
        } else {
            message = 'Error en la peticion';
        }

        return res.status(status).json({ message });
    }
};

const getCartById = async (req, res) => {
    try {
        // Validar que el id del carrito sea un número entero
        if (isNaN(req.params.cartId) || parseInt(req.params.cartId) <= 0) {
            return res.status(400).json({ message: "El id del carrito debe ser un número entero positivo" });
        }
        const cartId = parseInt(req.params.cartId);
        const userId = req.user.userId;

        const cartData = await getCartByIdService(userId, cartId);

        return res.status(200).json({
            message: "Carrito obtenido correctamente",
            data: cartData
        });

    } catch (error) {
        console.error("Error al obtener carrito:", error);

        const status = error.statusCode || 500;
        const message = error.message || "Error interno del servidor";

        return res.status(status).json({ message });
    }
};

const getCartsByUser = async (req, res) => {
    const userId = req.user.userId;
    const userType = req.user.idUserType;

    try {
        const carts = await getCartsByIdUserService(userId, userId, userType);
        return res.status(200).json({
            message: "Carritos del usuario autenticado obtenidos correctamente",
            data: carts
        });
    } catch (error) {
        console.error("Error:", error);
        const status = error.statusCode || 500;
        return res.status(status).json({ message: error.message || "Error del servidor" });
    }
};

const getCartsByUserId = async (req, res) => {
    const requestingUserId = req.user.userId;
    const requestingUserType = req.user.userType;
    const targetUserId = parseInt(req.params.userId);

    if (isNaN(targetUserId) || targetUserId <= 0) {
        return res.status(400).json({ message: "El ID del usuario debe ser un número entero positivo" });
    }

    try {
        const carts = await getCartsByIdUserService(requestingUserId, targetUserId, requestingUserType);
        return res.status(200).json({
            message: `Carritos del usuario ${targetUserId} obtenidos correctamente`,
            data: carts
        });
    } catch (error) {
        console.error("Error:", error);
        const status = error.statusCode || 500;
        return res.status(status).json({ message: error.message || "Error del servidor" });
    }
};

const getLastItemCartForProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { idProduct } = req.params;

        if (!idProduct) {
            return res.status(400).json({ message: "idProduct es requerido" });
        }

        const result = await getLastItemCartForProductService(userId, idProduct);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener último itemCart:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addItemToCart,
    addOneItemToCart,
    softDeleteItemFromCart,
    getItemsCart,
    getTotalAmountCart,
    getItemsQuantityCart,
    disableCart,
    getCartById,
    getCartsByUserId,
    getCartsByUser,
    addItemToCartPersonalized,
    getLastItemCartForProduct

};
