const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function getProducts(page = 1, limit = 5) {
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

module.exports = { getProducts, createProduct, updateProductDetails };
