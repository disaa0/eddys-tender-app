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
module.exports = { getProducts, createProduct };
