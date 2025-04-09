const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addItemToCartService = async (userId, idProduct, quantity) => {

    if (!quantity || quantity <= 0) {
        throw new Error("La cantidad debe ser mayor a 0");
    }


    return await prisma.$transaction(async (prisma) => {

        //Verificar si el producto existe y está activo
        const product = await prisma.product.findUnique({
            where: { idProduct: parseInt(idProduct) }
        });

        if (!product) {
            throw new Error("Producto no encontrado");
        }

        if (!product.status) {
            throw new Error("El producto está inactivo y no se puede agregar al carrito");
        }


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


        // 5. Agregar el producto al carrito
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

const addOneItemToCartService = async (userId, idProduct) => {
    return await prisma.$transaction(async (prisma) => {

        //Verificar si el producto existe y está activo
        const product = await prisma.product.findUnique({
            where: { idProduct: parseInt(idProduct) }
        });

        if (!product) {
            throw new Error("Producto no encontrado");
        }

        if (!product.status) {
            throw new Error("El producto esta inactivo y no se puede agregar al carrito");
        }
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
        }
        );

        //3.1 Si la cantidad es 100, no se puede agregar más
        if (existingItem && existingItem.quantity >= 100) {
            throw new Error("cantidad maxima alcanzada");
        }

        if (existingItem) {
            // 4. Si el producto ya existe en el carrito, actualizar la cantidad
            const updatedItem = await prisma.itemCart.update({
                where: { idItemCart: existingItem.idItemCart },
                data: { quantity: existingItem.quantity + 1, status: existingItem.status = true }
            });
            return { cartId, item: updatedItem, updated: true };
        }
        // 5. Agregar el producto al carrito
        const newItem = await prisma.itemCart.create({
            data: {
                idCart: cartId,
                idProduct: parseInt(idProduct),
                quantity: 1,
                individualPrice: product.price,
                status: true
            }
        });
        return { cartId, item: newItem, updated: false };
    });
};

const softDeleteItemFromCartService = async (userId, idProduct) => {
    return await prisma.$transaction(async (prisma) => {
        // Buscar el carrito activo del usuario
        const cart = await prisma.cart.findFirst({
            where: {
                idUser: userId,
                status: true
            }
        });

        if (!cart) {
            throw new Error("No se encontró un carrito activo para el usuario.");
        }

        // Buscar el producto en el carrito
        const itemCart = await prisma.itemCart.findFirst({
            where: {
                idCart: cart.idCart,
                idProduct: parseInt(idProduct),
                status: true
            }
        });

        if (!itemCart) {
            throw new Error("El producto no está en el carrito o ya ha sido eliminado.");
        }

        // Marcar el producto como inactivo (soft delete)
        const updatedItem = await prisma.itemCart.update({
            where: { idItemCart: itemCart.idItemCart },
            data: { quantity: 0, status: false }
        });

        return { cartId: cart.idCart, item: updatedItem };
    });
};

const getItemsCartService = async (userId) => {
    return await prisma.$transaction(async (prisma) => {
        // Buscar el carrito activo del usuario
        const cart = await prisma.cart.findFirst({
            where: {
                idUser: userId,
                status: true
            }
        });

        if (!cart) {
            throw new Error("No se encontró un carrito activo para el usuario.");
        }

        // Buscar los productos en el carrito y excluir los productos inactivos
        const items = await prisma.itemCart.findMany({
            where: {
                idCart: cart.idCart,
                status: true,
                product: { status: true } // Solo productos activos
            },
            include: {
                product: true
            }
        });

        if (items.length === 0) {
            throw new Error("No hay productos en el carrito.");
        }

        return { cartId: cart.idCart, items };
    });
};

const getTotalAmountCartService = async (userId) => {
    return await prisma.$transaction(async (prisma) => {
        // Buscar el carrito activo del usuario
        const cart = await prisma.cart.findFirst({
            where: {
                idUser: userId,
                status: true
            }
        });

        if (!cart) {
            throw new Error("No se encontró un carrito activo para el usuario.");
        }

        // Buscar los productos en el carrito y excluir los productos inactivos
        const items = await prisma.itemCart.findMany({
            where: {
                idCart: cart.idCart,
                status: true,
                product: { status: true } // Solo productos activos
            },
            include: {
                product: true
            }
        });

        if (items.length === 0) {
            throw new Error("No hay productos en el carrito.");
        }

        // Calcular el total del carrito
        const totalAmount = items.reduce((total, item) => {
            return total + (item.quantity * item.individualPrice);
        }, 0);

        return { cartId: cart.idCart, totalAmount };
    });
};

const getItemsQuantityCartService = async (userId) => {
    return await prisma.$transaction(async (prisma) => {
        // Buscar el carrito activo del usuario
        const cart = await prisma.cart.findFirst({
            where: {
                idUser: userId,
                status: true
            }
        });

        if (!cart) {
            throw new Error("No se encontró un carrito activo para el usuario.");
        }

        // Buscar los productos en el carrito y excluir los productos inactivos
        const items = await prisma.itemCart.findMany({
            where: {
                idCart: cart.idCart,
                status: true,
                product: { status: true } // Solo productos activos
            }
        });

        if (items.length === 0) {
            return { cartId: cart.idCart, totalQuantity: 0 };
        }

        // Calcular la cantidad total de items en el carrito
        const totalQuantity = items.reduce((total, item) => {
            return total + item.quantity;
        }, 0);

        return { cartId: cart.idCart, totalQuantity };
    });
};

module.exports = {
    addItemToCartService,
    addOneItemToCartService,
    softDeleteItemFromCartService,
    getItemsCartService,
    getTotalAmountCartService,
    getItemsQuantityCartService
};
