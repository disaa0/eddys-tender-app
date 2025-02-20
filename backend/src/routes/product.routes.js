const express = require('express');

const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { getAllProducts, addProduct, modifyProductDetails, getProduct } = require('../controllers/product.controller');


const router = express.Router();

// Obtener listado de productos (admistrador) con paginacion
router.get('/admin/products', authenticateToken, isAdmin, getAllProducts);
// Obtener un producto específico
router.get('/admin/products/:id', authenticateToken, isAdmin, getProduct);
router.post('/admin/products', authenticateToken, isAdmin, addProduct);
router.put('/admin/products/:id', authenticateToken, isAdmin, modifyProductDetails);


module.exports = router;