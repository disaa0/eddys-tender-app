const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function toggleProductStatus(productId) {
    try {
        // Find current product
        const product = await prisma.product.findUnique({
            where: { idProduct: productId }
        });

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        // Toggle status
        const updatedProduct = await prisma.product.update({
            where: { idProduct: productId },
            data: { status: !product.status }
        });

        return {
            message: `Producto ${updatedProduct.status ? 'activado' : 'desactivado'} exitosamente`,
            product: updatedProduct
        };
    } catch (error) {
        throw new Error(`Error al cambiar estado del producto: ${error.message}`);
    }
}

async function updateProductCustomization(productId, customizationData, userId) {
    // Verificar si el producto existe
    const product = await prisma.product.findUnique({
        where: { idProduct: productId }
    });

    if (!product) {
        throw new Error('Producto no encontrado');
    }

    // Crear o actualizar personalización
    const personalization = await prisma.personalization.create({
        data: {
            name: customizationData.name,
            status: customizationData.status,
            idUserAdded: userId,
        }
    });

    // Vincular personalización con el producto
    const productPersonalization = await prisma.productPersonalization.create({
        data: {
            idProduct: productId,
            idPersonalization: personalization.idPersonalization,
            idUserAdded: userId,
            status: true
        }
    });

    return {
        message: 'Personalización actualizada exitosamente',
        personalization,
        productPersonalization
    };
}

module.exports = {
    toggleProductStatus,
    updateProductCustomization,
}; 