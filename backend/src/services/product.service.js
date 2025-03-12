const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProductDetailsService = async (productId, userType) => {
    const product = await prisma.product.findFirst({
        where: {
            idProduct: productId,
            ...(userType !== 1 && { status: true }) // Si no es admin, solo mostrar productos activos
        }
    });

    if (!product) {
        throw new Error("Producto no encontrado");
    }

    // Si no es admin(userType es diferente de 1), excluimos el campo idUserAdded de product
    if (userType !== 1) {
        const { idUserAdded, ...rest } = product;
        return rest;
    } else {
        return product;
    }
};


async function getProducts(userType) {

    const products = await prisma.product.findMany({
        where: userType !== 1 ? { status: true } : {},
        orderBy: { createdAt: 'desc' },
    });

    // Si no es admin, excluimos el campo idUserAdded
    return userType === 1
        ? products
        : products.map(({ idUserAdded, ...rest }) => rest);
}

async function getProductsPagitination(page = 1, limit = 5) {
    const skip = (page - 1) * limit;
    const products = await prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' } // Ordenar por fecha de creación
    });

    const totalProducts = await prisma.product.count();
    const totalPages = Math.ceil(totalProducts / limit);

    return {
        products,
        totalPages,
        currentPage: page
    };
}

async function createProduct(userId, data) {
    try {
        const product = await prisma.product.create({
            data: {
                ...data,
                idUserAdded: userId
            }
        });

        return product;
    }
    catch (error) {
        throw new Error(error.message);
    }
}

async function updateProductDetails(productId, data) {
    try {
        const existingProduct = await prisma.product.findUnique({
            where: { idProduct: productId }
        });

        if (!existingProduct) {
            throw new Error("Producto no encontrado");
        }

        // Convert price to float if it exists in the data
        const updateData = {
            ...data,
            price: data.price !== undefined ? parseFloat(data.price) : existingProduct.price
        };

        // Actualizar los campos que se envían
        const updatedProduct = await prisma.product.update({
            where: { idProduct: productId },
            data: updateData
        });

        return updatedProduct;
    } catch (error) {
        console.error('Update product error:', error);
        throw new Error(error.message);
    }
}

module.exports = { getProducts, getProductDetailsService, getProductsPagitination, createProduct, updateProductDetails };
