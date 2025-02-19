const { getProducts } = require('../services/product.service');
const { productSchema } = require('../middlewares/validateInput');
const { createProduct } = require('../services/product.service');

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

module.exports = { getAllProducts, addProduct };
