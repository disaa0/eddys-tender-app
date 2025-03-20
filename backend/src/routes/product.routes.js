const express = require('express');

const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { getProductPersonalizationsForUsers, getAllProducts, getAllProductsPagination, addProduct, modifyProductDetails, getProduct, getProductDetails, getProductPersonalizations, updateProductPersonalizationForUser, updateProductPersonalization, updatePersonalizationStatusForUser, updatePersonalizationStatus, getProductImage, searchProducts, getPopularProducts } = require('../controllers/product.controller');
const { validateCustomization, validateSearchQuery } = require('../middlewares/validateInput');


const router = express.Router();

// Obtener listado de productos (admistrador) con paginacion
router.get('/admin/products', authenticateToken, isAdmin, getAllProductsPagination);

// Obtener un producto específico
router.get('/admin/products/:id', authenticateToken, isAdmin, getProduct);
router.post('/admin/products', authenticateToken, isAdmin, addProduct);
router.put('/admin/products/:id', authenticateToken, isAdmin, modifyProductDetails);

// New image route - public access without authentication
router.get('/:id/image', getProductImage);

// New personalization routes admin
router.get('/:id/personalizations', authenticateToken, isAdmin, getProductPersonalizations);
router.put('/:id/personalization', authenticateToken, isAdmin, validateCustomization, updateProductPersonalization);
router.patch('/:id/personalization/:personalizationId/status',
    authenticateToken,
    isAdmin,
    updatePersonalizationStatus
);

// New personalization routes user
router.get('/:id/user/personalizations', authenticateToken, getProductPersonalizationsForUsers);
router.put('/:id/user/personalization', authenticateToken, validateCustomization, updateProductPersonalizationForUser);
router.patch('/:id/user/personalization/:personalizationId/status',
    authenticateToken,
    updatePersonalizationStatusForUser
);

// Add this route before other product routes
router.get('/search', authenticateToken, validateSearchQuery, searchProducts);

// Add this route before other product routes to avoid conflicts
router.get('/popular', authenticateToken, getPopularProducts);

// Rutas dinamicas al final, el orden es importante
router.get('/', authenticateToken, getAllProducts);
router.get('/:id', authenticateToken, getProductDetails);

module.exports = router;