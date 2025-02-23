const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');
const { getAllProducts, getProduct, addProduct, modifyProductDetails } = require('../controllers/product.controller');
const { toggleProductStatus, updateProductCustomization } = require('../controllers/admin.controller');

// Apply authentication middleware to all admin routes
router.use(authenticateToken);

// Admin product routes
router.get('/products', isAdmin, getAllProducts);
router.get('/products/:id', isAdmin, getProduct);
router.post('/products', isAdmin, addProduct);
router.put('/products/:id', isAdmin, modifyProductDetails);
router.patch('/products/:id/status', isAdmin, toggleProductStatus);
router.put('/products/:id/customization', isAdmin, updateProductCustomization);

module.exports = router; 