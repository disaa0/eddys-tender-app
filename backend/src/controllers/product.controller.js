const { getProducts, createProduct, updateProductDetails, getProductsPagitination, getProductDetailsService } = require('../services/product.service');
const { productSchema, productDetailsSchema } = require('../middlewares/validateInput');
const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');

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

const getProductDetails = async (req, res) => {
    const productId = parseInt(req.params.id);
    const userType = req.user.userType;

    try {
        const product = await getProductDetailsService(productId, userType);
        return res.status(200).json(product);
    } catch (error) {
        if (error.message === "Producto no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        return res.status(404).json({ message: error.message });
    }
};


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

async function getProductImage(req, res) {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
            return res.status(400).json({
                message: "ID de producto inválido"
            });
        }

        const product = await prisma.product.findUnique({
            where: { idProduct: productId }
        });

        if (!product) {
            return res.status(404).json({
                message: "Producto no encontrado"
            });
        }

        // Look for the product image with exact filename pattern
        const uploadDir = path.join(__dirname, '../../uploads/products');
        const expectedFilename = `product-${productId}`;

        // Get all files in the directory
        const files = fs.readdirSync(uploadDir);

        // Find the file that matches our pattern (allowing for any extension)
        const productImage = files.find(file => {
            const filename = path.parse(file).name; // Get filename without extension
            return filename === expectedFilename;
        });

        if (!productImage) {
            return res.status(404).json({
                message: "Este producto no tiene una imagen"
            });
        }

        // Send the image file
        res.sendFile(path.join(uploadDir, productImage));

    } catch (error) {
        console.error('Error getting product image:', error);
        res.status(500).json({
            message: "Error al obtener la imagen del producto",
            error: error.message
        });
    }
}

const searchProducts = async (req, res) => {
    try {
        const { name, type, minPrice, maxPrice, status, page = 1, limit = 10 } = req.query;

        // Build where clause
        const where = {};

        // Add name filter if provided (MySQL is case-insensitive by default)
        if (name) {
            where.name = {
                contains: name
            };
        }

        // Add type filter if provided
        if (type) {
            where.productType = {
                type: {
                    equals: type // MySQL is case-insensitive by default
                }
            };
        }

        // Add price range if provided
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        // Add status filter if admin
        if (req.user.idUserType === 1 && status !== undefined) {
            where.status = status === 'true';
        } else {
            // Non-admin users can only see active products
            where.status = true;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get total count for pagination
        const totalCount = await prisma.product.count({ where });

        // Get products
        const products = await prisma.product.findMany({
            where,
            include: {
                productType: {
                    select: {
                        type: true
                    }
                }
            },
            skip,
            take: parseInt(limit),
            orderBy: {
                name: 'asc'
            }
        });

        return res.status(200).json({
            message: "Productos encontrados",
            data: {
                products,
                pagination: {
                    totalItems: totalCount,
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    currentPage: parseInt(page),
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error searching products:', error);
        return res.status(500).json({
            message: "Error al buscar productos",
            error: error.toString()
        });
    }
};

async function getPopularProducts(req, res) {
    try {
        const { limit = 5 } = req.query;
        const limitNum = parseInt(limit);

        // Get popular products using Prisma aggregation
        const popularProducts = await prisma.product.findMany({
            where: {
                status: true, // Only active products
                itemsCart: {
                    some: {} // Has any items in cart
                }
            },
            include: {
                productType: {
                    select: {
                        type: true
                    }
                },
                _count: {
                    select: {
                        itemsCart: true
                    }
                }
            },
            orderBy: {
                itemsCart: {
                    _count: 'desc'
                }
            },
            take: limitNum
        });
        console.log(popularProducts)
        // Format the response
        const formattedProducts = popularProducts.map(product => ({
            ...product,
            popularity: product._count.itemsCart,
            _count: undefined // Remove the _count field from response
        }));

        return res.status(200).json({
            message: "Productos populares obtenidos correctamente",
            data: {
                products: formattedProducts
            }
        });

    } catch (error) {
        console.error('Error getting popular products:', error);
        return res.status(500).json({
            message: "Error al obtener productos populares",
            error: error.toString()
        });
    }
}

module.exports = { getAllProducts, getAllProductsPagination, getProduct, addProduct, modifyProductDetails, getProductPersonalizations, updateProductPersonalization, updatePersonalizationStatus, getProductImage, searchProducts, getPopularProducts, getProductDetails };
