const express = require('express');

const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { getAllProducts, addProduct, modifyProductDetails, getProduct, getProductPersonalizations, updateProductPersonalization, updatePersonalizationStatus } = require('../controllers/product.controller');
const { validateCustomization } = require('../middlewares/validateInput');


const router = express.Router();

// Obtener listado de productos (admistrador) con paginacion
router.get('/admin/products', authenticateToken, isAdmin, getAllProducts);
// Obtener un producto específico
router.get('/admin/products/:id', authenticateToken, isAdmin, getProduct);
router.post('/admin/products', authenticateToken, isAdmin, addProduct);
router.put('/admin/products/:id', authenticateToken, isAdmin, modifyProductDetails);

// New personalization routes
router.get('/:id/personalizations', authenticateToken, isAdmin, getProductPersonalizations);
router.put('/:id/personalization', authenticateToken, isAdmin, validateCustomization, updateProductPersonalization);
router.patch('/:id/personalization/:personalizationId/status',
    authenticateToken,
    isAdmin,
    updatePersonalizationStatus
);

module.exports = router;