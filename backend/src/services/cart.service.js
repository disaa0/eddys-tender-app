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

        const totalQuantity = await prisma.itemCart.aggregate({
            where: { idCart: cartId, status: true },
            _sum: { quantity: true },
        });



        // 3. Verificar si el producto ya está en el carrito
        const existingItem = await prisma.itemCart.findFirst({
            where: {
                idCart: cartId,
                idProduct: parseInt(idProduct)
            },
            orderBy: {
                idItemCart: 'desc'
            }
        });

        const currentTotal = totalQuantity._sum.quantity || 0;

        const newTotal = existingItem
            ? currentTotal - existingItem.quantity + quantity
            : currentTotal + quantity;

        if (newTotal > 30) {
            throw new Error("El carrito no puede contener mas de 30 productos");
        }

        if (existingItem) {
            // 4. Si el producto ya existe en el carrito, actualizar la cantidad
            const updatedItem = await prisma.itemCart.update({
                where: { idItemCart: existingItem.idItemCart },
                data: { quantity: quantity, status: true }
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
    const product = await prisma.product.findUnique({
        where: { idProduct }
    });

    if (!product) {
        throw new Error('Producto no encontrado');
    }

    if (!product.status) {
        throw new Error('El producto está inactivo');
    }

    let cart = await prisma.cart.findFirst({
        where: {
            idUser: userId,
            status: true,
        },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: {
                idUser: userId,
                status: true,
            },
        });
    }

    const cartId = cart.idCart;

    const totalQuantity = await prisma.itemCart.aggregate({
        where: { idCart: cartId, status: true },
        _sum: { quantity: true },
    });

    const currentTotal = totalQuantity._sum.quantity || 0;

    const existingItems = await prisma.itemCart.findMany({
        where: {
            idCart: cartId,
            idProduct,
            status: true,
        },
        include: {
            userProductPersonalize: true
        },
        orderBy: {
            idItemCart: 'desc'
        }
    });

    let matchedItem = existingItems.find(item => item.userProductPersonalize.length === 0);

    const newTotal = matchedItem
        ? currentTotal - matchedItem.quantity + (matchedItem.quantity + 1)
        : currentTotal + 1;

    if (newTotal > 30) {
        throw new Error('El carrito no puede contener mas de 30 productos');
    }

    if (matchedItem) {
        const updatedItem = await prisma.itemCart.update({
            where: { idItemCart: matchedItem.idItemCart },
            data: { quantity: matchedItem.quantity + 1 }
        });

        return {
            message: 'Cantidad incrementada correctamente',
            statusCode: 200,
            data: {
                cartId,
                item: updatedItem,
                updated: true
            }
        };
    }

    const newItem = await prisma.itemCart.create({
        data: {
            idCart: cartId,
            idProduct,
            quantity: 1,
            individualPrice: product.price,
            status: true
        }
    });

    return {
        message: 'Producto agregado al carrito correctamente',
        statusCode: 201,
        data: {
            cartId,
            item: newItem,
            updated: false
        }
    };
};


const addItemToCartServicePersonalizations = async (userId, idProduct, quantity, personalizations = []) => {
    if (!quantity || quantity <= 0) {
        throw new Error("La cantidad debe ser mayor a 0");
    }

    return await prisma.$transaction(async (prisma) => {
        const product = await prisma.product.findUnique({
            where: { idProduct: parseInt(idProduct) },
        });

        if (!product) {
            throw new Error("Producto no encontrado");
        }

        if (!product.status) {
            throw new Error("El producto está inactivo y no se puede agregar al carrito");
        }

        const personalizationsIds = (personalizations || []).map(p => parseInt(p));

        // Validar que las personalizaciones existan, pertenezcan al producto y estén activas
        if (personalizationsIds.length > 0) {
            const validPersonalizations = await prisma.productPersonalization.findMany({
                where: {
                    idProductPersonalization: { in: personalizationsIds },
                    idProduct: parseInt(idProduct),
                    status: true
                }
            });

            const validIds = validPersonalizations.map(p => p.idProductPersonalization);
            const invalidIds = personalizationsIds.filter(id => !validIds.includes(id));

            if (invalidIds.length > 0) {
                throw new Error(`Las siguientes personalizaciones no son válidas o no están disponibles para este producto: [${invalidIds.join(', ')}]`);
            }
        }

        let cart = await prisma.cart.findFirst({
            where: {
                idUser: userId,
                status: true,
            },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    idUser: userId,
                    status: true,
                },
            });
        }

        const cartId = cart.idCart;

        const totalQuantity = await prisma.itemCart.aggregate({
            where: { idCart: cartId, status: true },
            _sum: { quantity: true },
        });

        const currentTotal = totalQuantity._sum.quantity || 0;

        const existingItems = await prisma.itemCart.findMany({
            where: {
                idCart: cartId,
                idProduct: parseInt(idProduct),
                status: true,
            },
            include: {
                userProductPersonalize: {
                    select: {
                        idProductPersonalization: true
                    }
                }
            },
            orderBy: {
                idItemCart: 'desc'
            }
        });

        const areSamePersonalizations = (a, b) => {
            const idsA = a.map(p => p.idProductPersonalization).sort();
            const idsB = b.map(p => parseInt(p)).sort();
            return idsA.length === idsB.length && idsA.every((val, i) => val === idsB[i]);
        };

        let matchedItem = null;

        for (const item of existingItems) {
            const itemPersonalizations = item.userProductPersonalize;

            if (personalizationsIds.length === 0 && itemPersonalizations.length === 0) {
                matchedItem = item;
                break;
            }

            if (personalizationsIds.length > 0 && itemPersonalizations.length > 0) {
                if (areSamePersonalizations(itemPersonalizations, personalizationsIds)) {
                    matchedItem = item;
                    break;
                }
            }
        }

        const newTotal = matchedItem
            ? currentTotal - matchedItem.quantity + quantity
            : currentTotal + quantity;

        if (newTotal > 30) {
            throw new Error("El carrito no puede contener más de 30 productos");
        }

        if (matchedItem) {
            const updatedItem = await prisma.itemCart.update({
                where: { idItemCart: matchedItem.idItemCart },
                data: { quantity: quantity, status: true }
            });

            return { cartId, item: updatedItem, updated: true };
        }

        const newItem = await prisma.itemCart.create({
            data: {
                idCart: cartId,
                idProduct: parseInt(idProduct),
                quantity,
                individualPrice: product.price,
                status: true
            }
        });

        if (personalizationsIds.length > 0) {
            const personalizeEntries = personalizationsIds.map(id => ({
                idItemCart: newItem.idItemCart,
                idProductPersonalization: id,
                status: true
            }));

            await prisma.userProductPersonalize.createMany({
                data: personalizeEntries
            });
        }

        return { cartId, item: newItem, updated: false };
    });
};

const softDeleteItemFromCartService = async (userId, idProduct) => {
    return await prisma.$transaction(async (prisma) => {
        const cart = await prisma.cart.findFirst({
            where: {
                idUser: userId,
                status: true
            }
        });

        if (!cart) {
            throw new Error("No se encontró un carrito activo para el usuario.");
        }

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

        // Eliminar lógicamente el itemCart
        const updatedItem = await prisma.itemCart.update({
            where: { idItemCart: itemCart.idItemCart },
            data: {
                quantity: 0,
                status: false
            }
        });

        // Soft delete de las personalizaciones asociadas
        await prisma.userProductPersonalize.updateMany({
            where: {
                idItemCart: itemCart.idItemCart,
                status: true
            },
            data: {
                status: false
            }
        });

        return {
            cartId: cart.idCart,
            item: updatedItem
        };
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
            return total + (item.quantity * item.product.price);
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

const disableCartService = async (userId) => {
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

        // Desactivar el carrito
        const disabledCart = await prisma.cart.update({
            where: { idCart: cart.idCart },
            data: { status: false }
        });

        return { cartId: disabledCart.idCart, status: disabledCart.status };
    });
};

const getCartByIdService = async (userId, cartId) => {
    // Buscar el carrito
    const cart = await prisma.cart.findUnique({
        where: { idCart: cartId }
    });

    if (!cart) {
        const error = new Error("Carrito no encontrado");
        error.statusCode = 404;
        throw error;
    }

    // Si no es admin, verificar propiedad del carrito
    // obtener userType desde prisma
    const user = await prisma.user.findUnique({
        where: { idUser: userId }
    });
    if (!user) {
        const error = new Error("Usuario no encontrado");
        error.statusCode = 404;
        throw error;
    }

    if (user.idUserType !== 1 && cart.idUser !== userId) {
        const error = new Error("No tienes permiso para ver este carrito");
        error.statusCode = 403;
        throw error;
    }

    // Buscar los productos en el carrito y excluir los productos inactivos
    const itemsCart = await prisma.itemCart.findMany({
        where: {
            idCart: cart.idCart,
            status: true,
            product: { status: true } // Solo productos activos
        },
        include: {
            product: true
        }
    });

    return {
        idCart: cart.idCart,
        idUser: cart.idUser,
        status: cart.status,
        items: itemsCart
    };
};

const getCartsByIdUserService = async (requestingUserId, targetUserId, requestingUserType) => {
    const user = await prisma.user.findUnique({
        where: { idUser: targetUserId }
    });

    if (!user) {
        const error = new Error("Usuario no encontrado");
        error.statusCode = 404;
        throw error;
    }

    if (requestingUserType !== 1 && requestingUserId !== targetUserId) {
        const error = new Error("No tienes permiso para ver estos carritos");
        error.statusCode = 403;
        throw error;
    }

    const carts = await prisma.cart.findMany({
        where: { idUser: targetUserId },
        include: {
            itemsCart: {
                where: {
                    status: true,
                    product: { status: true }
                },
                include: {
                    product: true
                }
            }
        }
    });

    if (carts.length === 0) {
        const error = new Error("Carritos no encontrados");
        error.statusCode = 404;
        throw error;
    }

    return carts;
};

const getLastItemCartForProductService = async (userId, idProduct) => {
    return await prisma.$transaction(async (prisma) => {
        const cart = await prisma.cart.findFirst({
            where: {
                idUser: userId,
                status: true,
            },
        });

        if (!cart) {
            throw new Error("No se encontró un carrito activo para el usuario.");
        }

        const lastItem = await prisma.itemCart.findFirst({
            where: {
                idCart: cart.idCart,
                idProduct: parseInt(idProduct),
                status: true
            },
            orderBy: {
                idItemCart: "desc",
            },
            include: {
                product: {
                    select: {
                        name: true
                    }
                },
                userProductPersonalize: {
                    where: { status: true },
                    select: {
                        idUserProductPersonalize: true,
                        idItemCart: true,
                        idProductPersonalization: true,
                        status: true,
                        productPersonalization: {
                            select: {
                                personalization: {
                                    select: {
                                        idPersonalization: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!lastItem) {
            throw new Error("No se encontró ningún itemCart para este producto.");
        }

        const itemWithName = {
            idItemCart: lastItem.idItemCart,
            idCart: lastItem.idCart,
            idProduct: lastItem.idProduct,
            quantity: lastItem.quantity,
            individualPrice: lastItem.individualPrice,
            status: lastItem.status,
            name: lastItem.product.name,
            userProductPersonalize: lastItem.userProductPersonalize.map(p => ({
                idUserProductPersonalize: p.idUserProductPersonalize,
                idItemCart: p.idItemCart,
                idProductPersonalization: p.idProductPersonalization,
                status: p.status,
                personalization: p.productPersonalization.personalization
            }))
        };

        return {
            cartId: cart.idCart,
            item: itemWithName
        };
    });
};


module.exports = {
    addItemToCartService,
    addOneItemToCartService,
    softDeleteItemFromCartService,
    getItemsCartService,
    getTotalAmountCartService,
    getItemsQuantityCartService,
    disableCartService,
    getCartByIdService,
    getCartsByIdUserService,
    addItemToCartServicePersonalizations,
    getLastItemCartForProductService
};
