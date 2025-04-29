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

        // Check if product image exists
        const imagePath = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.jpg`);
        const imagePng = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.png`);
        const imageWebp = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.webp`);
        
        let productWithImage = {...product};
        
        if (fs.existsSync(imagePath) || fs.existsSync(imagePng) || fs.existsSync(imageWebp)) {
            // Add image URL only if the image exists
            productWithImage.image_url = `/api/products/${product.idProduct}/image`;
        }

        res.json({
            message: "Producto obtenido correctamente",
            data: {
                product: productWithImage
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

async function getProductPersonalizationsForUsers(req, res) {
    try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            return res.status(400).json({ message: "ID de producto inválido" });
        }

        const personalizations = await prisma.productPersonalization.findMany({
            where: {
                idProduct: productId
            },
            select: {
                idProductPersonalization: true,
                idProduct: true,
                status: true,
                personalization: {
                    select: {
                        idPersonalization: true,
                        name: true,
                        createdAt: true
                    }
                }
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
            message: "Personalizacion actualizada exitosamente",
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

async function updateProductPersonalizationForUser(req, res) {
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

        // Eliminar idUserAdded de los objetos antes de enviarlos en la respuesta
        const Personalization = (({ idUserAdded, ...rest }) => rest)(personalization);
        const ProductPersonalization = (({ idUserAdded, ...rest }) => rest)(productPersonalization);


        res.json({
            message: "Personalizacion actualizada exitosamente",
            data: {
                Personalization,
                ProductPersonalization
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

async function assignProductPersonalizationToCartItem(req, res) {
    try {
        const userId = req.user.userId;
        const { idItemCart, idProductPersonalization } = req.body;

        if (isNaN(idItemCart) || isNaN(idProductPersonalization)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const productPersonalization = await prisma.productPersonalization.findFirst({
            where: { idProductPersonalization },
        });

        if (!productPersonalization) {
            return res.status(404).json({ message: "La personalización no fue encontrada" });
        }

        const itemCart = await prisma.itemCart.findFirst({
            where: { idItemCart },
            include: { cart: true },
        });

        if (!itemCart || itemCart.cart?.idUser !== userId) {
            return res.status(403).json({ message: "No puedes modificar este producto del carrito" });
        }

        if (itemCart.idProduct !== productPersonalization.idProduct) {
            return res.status(400).json({ message: "La personalización no corresponde al producto del carrito" });
        }

        const existing = await prisma.userProductPersonalize.findFirst({
            where: {
                idItemCart,
                idProductPersonalization,
                itemCart: {
                    cart: {
                        idUser: userId,
                    },
                },
            },
        });

        let updatedOrCreated;

        if (existing) {
            updatedOrCreated = await prisma.userProductPersonalize.update({
                where: { idUserProductPersonalize: existing.idUserProductPersonalize },
                data: { status: true },
                include: {
                    productPersonalization: true,
                    itemCart: true,
                },
            });
        } else {
            updatedOrCreated = await prisma.userProductPersonalize.create({
                data: {
                    idItemCart,
                    idProductPersonalization,
                    status: true,
                },
                include: {
                    productPersonalization: true,
                    itemCart: true,
                },
            });
        }

        res.json({
            message: "Personalización asignada correctamente al producto del carrito",
            data: updatedOrCreated,
        });
    } catch (error) {
        console.error("Error al asignar personalización:", error);
        res.status(500).json({
            message: "Error al asignar personalización",
            error: error.message,
        });
    }
}

async function getPersonalizationsForCartItem(req, res) {
    try {
        const userId = req.user.userId;
        const idItemCart = parseInt(req.params.idItemCart);

        if (isNaN(idItemCart)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const itemCart = await prisma.itemCart.findFirst({
            where: { idItemCart, cart: { idUser: userId } },
        });

        if (!itemCart) {
            return res.status(404).json({ message: "Producto del carrito no encontrado" });
        }

        const personalizations = await prisma.userProductPersonalize.findMany({
            where: {
                idItemCart,
            },
            include: {
                productPersonalization: {
                    include: {
                        personalization: true,
                    },
                },
                itemCart: true,
            },
        });

        const sanitized = personalizations.map(p => ({
            ...p,
            productPersonalization: {
                ...p.productPersonalization,
                personalization: {
                    idPersonalization: p.productPersonalization.personalization.idPersonalization,
                    name: p.productPersonalization.personalization.name,
                    status: p.productPersonalization.personalization.status,
                },
            },
        }));

        res.json({
            message: "Personalizaciones recuperadas correctamente",
            data: sanitized,
        });

    } catch (error) {
        console.error("Error al recuperar personalizaciones:", error);
        res.status(500).json({ message: "Error interno", error: error.message });
    }
}

async function togglePersonalizationStatusForCartItem(req, res) {
    try {
        const userId = req.user.userId;
        const id = parseInt(req.params.idUserProductPersonalize);
        const { status } = req.body;

        if (isNaN(id) || typeof status !== "boolean") {
            return res.status(400).json({ message: "Datos inválidos" });
        }

        const personalization = await prisma.userProductPersonalize.findFirst({
            where: { idUserProductPersonalize: id },
            include: {
                itemCart: {
                    include: {
                        cart: true,
                    },
                },
            },
        });

        if (!personalization || personalization.itemCart.cart?.idUser !== userId) {
            return res.status(403).json({ message: "No puedes modificar esta personalización" });
        }

        const updated = await prisma.userProductPersonalize.update({
            where: { idUserProductPersonalize: id },
            data: { status },
        });

        res.json({
            message: `Personalización ${status ? "activada" : "desactivada"} correctamente`,
            data: updated,
        });
    } catch (error) {
        console.error("Error al cambiar el estado de personalización:", error);
        res.status(500).json({ message: "Error interno", error: error.message });
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

async function updatePersonalizationStatusForUser(req, res) {
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

        // Eliminar idUserAdded de la personalización y su relación
        const sanitizedPersonalization = (({ idUserAdded, ...rest }) => ({
            ...rest,
            personalization: (({ idUserAdded, ...innerRest }) => innerRest)(rest.personalization)
        }))(updatedPersonalization);

        res.json({
            message: "Estado de personalización actualizado correctamente",
            data: { personalization: sanitizedPersonalization }
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

        return res.status(200).json({
            message: "Productos encontrados",
            data: {
                products: productsWithImages,
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
        // Format the response with image URLs if they exist
        const formattedProducts = await Promise.all(popularProducts.map(async product => {
            const imagePath = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.jpg`);
            const imagePng = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.png`); 
            const imageWebp = path.join(__dirname, '../../uploads/products', `product-${product.idProduct}.webp`);
            
            const productObj = {
                ...product,
                popularity: product._count.itemsCart,
                _count: undefined // Remove the _count field from response
            };
            
            if (fs.existsSync(imagePath) || fs.existsSync(imagePng) || fs.existsSync(imageWebp)) {
                // Add image URL only if the image exists
                productObj.image_url = `/api/products/${product.idProduct}/image`;
            }
            
            return productObj;
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

module.exports = { getAllProducts, getAllProductsPagination, getProduct, addProduct, modifyProductDetails, getProductPersonalizations, updateProductPersonalization, updateProductPersonalizationForUser, updatePersonalizationStatus, updatePersonalizationStatusForUser, getProductPersonalizationsForUsers, getProductImage, searchProducts, getPopularProducts, getProductDetails, assignProductPersonalizationToCartItem, getPersonalizationsForCartItem, togglePersonalizationStatusForCartItem };
