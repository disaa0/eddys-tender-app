const express = require('express');

const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { getAllProducts } = require('../controllers/product.controller');
const { addProduct } = require('../controllers/product.controller');

const router = express.Router();

// Obtener listado de productos (admistrador) con paginacion
router.get('/admin/products', authenticateToken, isAdmin, getAllProducts);
router.post('/admin/products', authenticateToken, isAdmin, addProduct);

module.exports = router;