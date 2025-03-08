const { getProducts, createProduct, updateProductDetails, getProductsPagitination } = require('../services/product.service');
const { productSchema, productDetailsSchema } = require('../middlewares/validateInput');
const prisma = require('../lib/prisma');

async function getAllProductsPagination(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Fijo en 5 productos por página
        const data = await getProductsPagitination(page, limit);

        res.json({
            message: "Productos obtenidos correctamente",
            data
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos", error: error.message });
    }
}

async function getAllProducts(req, res) {
    try {
        const userType = req.user.userType;
        const products = await getProducts(userType);

        if (!products) {
            return res.status(404).json({
                message: "No se encontraron productos"
            });
        }

        res.status(200).json({
            message: "Productos obtenidos correctamente",
            data: { products }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error del servidor al obtener productos",
            error: error.message
        });
    }
}

async function addProduct(req, res) {
    try {
        const parsedData = productSchema.parse(req.body); // Validar datos con Zod

        const newProduct = await createProduct(req.user.userId, parsedData);

        res.status(201).json({
            message: "Producto agregado exitosamente",
            product: newProduct
        });
    } catch (error) {
        res.status(400).json({
            message: "Error al agregar producto",
            error: error.errors || error.message
        });
    }
}

async function modifyProductDetails(req, res) {
    try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "ID de producto inválido" });
        }

        // Parse the price as a float if it exists
        const updateData = {
            ...req.body,
            price: req.body.price ? parseFloat(req.body.price) : undefined
        };

        const parsedData = productDetailsSchema.parse(updateData);

        const updatedProduct = await updateProductDetails(productId, parsedData);

        res.status(200).json({
            message: "Detalles del producto actualizados correctamente",
            product: updatedProduct
        });
    } catch (error) {
        console.error('Modify product error:', error);
        res.status(400).json({
            message: "Error al actualizar detalles del producto",
            error: error.errors || error.message
        });
    }
}

async function getProduct(req, res) {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
            return res.status(400).json({
                message: "ID de producto inválido"
            });
        }

        const product = await prisma.product.findUnique({
            where: { idProduct: productId },
            include: {
                productType: {
                    select: {
                        type: true
                    }
                }
            }
        });

        if (!product) {
            return res.status(404).json({
                message: "Producto no encontrado"
            });
        }

        res.json({
            message: "Producto obtenido correctamente",
            data: {
                product: product
            }
        });
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({
            message: "Error al obtener el producto",
            error: error.message
        });
    }
}

async function getProductPersonalizations(req, res) {
    try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "ID de producto inválido" });
        }

        const personalizations = await prisma.productPersonalization.findMany({
            where: {
                idProduct: productId,
                status: true
            },
            include: {
                personalization: true
            }
        });

        res.json({
            message: "Personalizaciones obtenidas correctamente",
            data: { personalizations }
        });
    } catch (error) {
        console.error('Error getting personalizations:', error);
        res.status(500).json({
            message: "Error al obtener personalizaciones",
            error: error.message
        });
    }
}

async function updateProductPersonalization(req, res) {
    try {
        const productId = parseInt(req.params.id);
        const { name, status } = req.body;
        const userId = req.user.userId;

        // Create or update personalization
        const personalization = await prisma.personalization.create({
            data: {
                name,
                status,
                idUserAdded: userId,
            }
        });

        // Link personalization to product
        const productPersonalization = await prisma.productPersonalization.create({
            data: {
                idProduct: productId,
                idPersonalization: personalization.idPersonalization,
                idUserAdded: userId,
                status: true
            }
        });

        res.json({
            message: "Personalización actualizada exitosamente",
            data: {
                personalization,
                productPersonalization
            }
        });
    } catch (error) {
        console.error('Error updating personalization:', error);
        res.status(400).json({
            message: "Error al actualizar personalización",
            error: error.message
        });
    }
}

async function updatePersonalizationStatus(req, res) {
    try {
        const productId = parseInt(req.params.id);
        const personalizationId = parseInt(req.params.personalizationId);
        const { status } = req.body;

        if (isNaN(productId) || isNaN(personalizationId)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const updatedPersonalization = await prisma.productPersonalization.update({
            where: {
                idProductPersonalization: personalizationId,
                idProduct: productId
            },
            data: { status },
            include: {
                personalization: true
            }
        });

        res.json({
            message: "Estado de personalización actualizado correctamente",
            data: { personalization: updatedPersonalization }
        });
    } catch (error) {
        console.error('Error updating personalization status:', error);
        res.status(400).json({
            message: "Error al actualizar estado de personalización",
            error: error.message
        });
    }
}

module.exports = { getAllProducts, getAllProductsPagination, getProduct, addProduct, modifyProductDetails, getProductPersonalizations, updateProductPersonalization, updatePersonalizationStatus };
