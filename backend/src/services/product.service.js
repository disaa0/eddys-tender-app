const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

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

    // Check if product image exists (only jpg now)
    const imagePath = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.jpg`);
    
    let productWithImage = {...product};
    if (fs.existsSync(imagePath)) {
        // Add image URL only if the image exists
        productWithImage.image_url = `/api/products/${product.idProduct}/image`;
    }

    // Si no es admin(userType es diferente de 1), excluimos el campo idUserAdded de product
    if (userType !== 1) {
        const { idUserAdded, ...rest } = productWithImage;
        return rest;
    } else {
        return productWithImage;
    }
};


async function getProducts(userType) {
    const products = await prisma.product.findMany({
        where: userType !== 1 ? { status: true } : {},
        orderBy: { createdAt: 'desc' },
    });

    // Add image URL to each product only if image exists (only jpg now)
    const productsWithImages = await Promise.all(products.map(async product => {
        const imagePath = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.jpg`);
        
        let productWithImage = {...product};
        if (fs.existsSync(imagePath)) {
            // Add image URL only if the image exists
            productWithImage.image_url = `/api/products/${product.idProduct}/image`;
        }
        return productWithImage;
    }));

    // Si no es admin, excluimos el campo idUserAdded
    return userType === 1
        ? productsWithImages
        : productsWithImages.map(({ idUserAdded, ...rest }) => rest);
}

async function getProductsPagitination(page = 1, limit = 5) {
    const skip = (page - 1) * limit;
    const products = await prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' } // Ordenar por fecha de creación
    });

    // Add image URL to each product only if image exists
    const productsWithImages = await Promise.all(products.map(async product => {
        const imagePath = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.jpg`);
        const imagePng = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.png`); 
        const imageWebp = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.webp`);
        
        let productWithImage = {...product};
        if (fs.existsSync(imagePath) || fs.existsSync(imagePng) || fs.existsSync(imageWebp)) {
            // Add image URL only if the image exists
            productWithImage.image_url = `/api/products/${product.idProduct}/image`;
        }
        return productWithImage;
    }));

    const totalProducts = await prisma.product.count();
    const totalPages = Math.ceil(totalProducts / limit);

    return {
        products: productsWithImages,
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
