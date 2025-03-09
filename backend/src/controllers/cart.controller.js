const { addItemToCartService } = require('../services/cart.service');

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
            case 'La cantidad debe ser mayor a 0':
                message = 'El id del producto debe ser un número entero mayor que 0';
                break;
            case 'Producto no encontrado':
                status = 404;
                message = 'El producto no se ecuentra registrado';
                break;
            default:
                message = 'Error en la solicitud';
        }

        return res.status(status).json({ message });

    }
};

module.exports = {
    addItemToCart
};