const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');
const {
  getProduct,
  addProduct,
  modifyProductDetails,
  getAllProductsPagination,
} = require('../controllers/product.controller');
const {
  toggleProductStatus,
  updateProductCustomization,
  uploadProductImage,
} = require('../controllers/admin.controller');
const {
  getOrderHistory,
  getActiveOrders,
} = require('../controllers/order.controller');
const {
  handleProductImageUpload,
} = require('../middlewares/upload.middleware');
const { validateRegister, validateQueryProductIds } = require('../middlewares/validateInput');
const { registerAdmin } = require('../controllers/auth.controller');
const adminController = require('../controllers/admin.controller');
const {
  getOrdersByDateRange,
  updateOrderStatus,
  getOrderById,
  getOrdersByProducts,
} = require('../controllers/adminOrder.controller');
const { getCartsByUserId } = require('../controllers/cart.controller');

// Apply authentication middleware to all admin routes
router.use(authenticateToken);

// Admin product routes
router.get('/products', isAdmin, getAllProductsPagination);
router.get('/products/:id', isAdmin, getProduct);
router.post('/products', isAdmin, handleProductImageUpload, addProduct);
router.put('/products/:id', isAdmin, modifyProductDetails);
router.patch('/products/:id/status', isAdmin, toggleProductStatus);
router.put('/products/:id/customization', isAdmin, updateProductCustomization);

// Admin cart routes
router.get('/cart/user/:userId', authenticateToken, isAdmin, getCartsByUserId);

// Admin user routes
router.post('/register', isAdmin, validateRegister, registerAdmin);

// Admin order routes
router.get('/orders/history', isAdmin, getOrderHistory);
router.get('/orders/current', isAdmin, getActiveOrders);
router.get('/orders/by-products', isAdmin, validateQueryProductIds, getOrdersByProducts);
router.get('/orders', isAdmin, getOrdersByDateRange);
router.get('/orders/:id', isAdmin, getOrderById);
router.patch('/order/:id', isAdmin, updateOrderStatus);

// New route for uploading product images
router.post(
  '/products/:id/image',
  isAdmin,
  handleProductImageUpload,
  uploadProductImage
);

module.exports = router;
