const { getProducts, createProduct, updateProductDetails } = require('../services/product.service');
const { productSchema, productDetailsSchema } = require('../middlewares/validateInput');

async function getAllProducts(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Fijo en 5 productos por página
        const data = await getProducts(page, limit);

        res.json({
            message: "Productos obtenidos correctamente",
            data
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos", error: error.message });
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

        const parsedData = productDetailsSchema.parse(req.body);

        const updatedProduct = await updateProductDetails(productId, parsedData);

        res.status(200).json({
            message: "Detalles del producto actualizados correctamente",
            product: updatedProduct
        });
    } catch (error) {
        res.status(400).json({
            message: "Error al actualizar detalles del producto",
            error: error.errors || error.message
        });
    }
}


module.exports = { getAllProducts, addProduct, modifyProductDetails };
