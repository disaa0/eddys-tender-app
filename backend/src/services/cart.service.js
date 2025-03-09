const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addItemToCartService = async (userId, idProduct, quantity) => {

    if (!quantity || quantity <= 0) {
        throw new Error("La cantidad debe ser mayor a 0");
    }


    return await prisma.$transaction(async (prisma) => {


        // 1. Buscar un carrito activo del usuario 
        let cart = await prisma.cart.findFirst({
            where: {
                idUser: userId,
                status: true
            }
        });

        // 2. Si no existe, crear un nuevo carrito
        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    idUser: userId,
                    status: true
                }
            });
        }
        const cartId = cart.idCart;

        // 3. Verificar si el producto ya está en el carrito
        const existingItem = await prisma.itemCart.findFirst({
            where: {
                idCart: cartId,
                idProduct: parseInt(idProduct)
            }
        });

        if (existingItem) {
            // 4. Si el producto ya existe en el carrito, actualizar la cantidad
            const updatedItem = await prisma.itemCart.update({
                where: { idItemCart: existingItem.idItemCart },
                data: { quantity: existingItem.quantity = quantity, status: existingItem.status = true }
            });

            return { cartId, item: updatedItem, updated: true };
        }

        // 5. Obtener el precio del producto
        const product = await prisma.product.findUnique({
            where: { idProduct: parseInt(idProduct) }
        });

        if (!product) {
            throw new Error("Producto no encontrado");
        }

        // 6. Agregar el producto al carrito
        const newItem = await prisma.itemCart.create({
            data: {
                idCart: cartId,
                idProduct: parseInt(idProduct),
                quantity,
                individualPrice: product.price,
                status: true
            }
        });

        return { cartId, item: newItem, updated: false };
    });

};

module.exports = {
    addItemToCartService
};
