const adminService = require('../services/admin.service');
const prisma = require('../lib/prisma');
const path = require('path');
const fs = require('fs');

async function toggleProductStatus(req, res) {
    try {
        const { id } = req.params;
        const result = await adminService.toggleProductStatus(parseInt(id));
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function updateProductCustomization(req, res) {
    try {
        const { id } = req.params;
        const customizationData = req.body;
        const result = await adminService.updateProductCustomization(
            parseInt(id),
            customizationData,
            req.user.userId
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function uploadProductImage(req, res) {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
            return res.status(400).json({ message: "ID de producto inválido" });
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { idProduct: productId }
        });

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "No se ha subido ninguna imagen" });
        }

        // Get the filename that was created
        const filename = path.basename(req.file.path);

        res.status(200).json({
            message: "Imagen subida correctamente",
            product: {
                idProduct: product.idProduct,
                name: product.name,
                imageUrl: `/uploads/products/${filename}`
            }
        });
    } catch (error) {
        console.error('Error uploading product image:', error);
        res.status(500).json({
            message: "Error al subir la imagen del producto",
            error: error.message
        });
    }
}

module.exports = {
    toggleProductStatus,
    updateProductCustomization,
    uploadProductImage
}; 