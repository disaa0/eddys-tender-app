const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const {
    createOrder,
    getOrderDetails,
    getUserOrders,
    searchOrders,
    reoder
} = require('../controllers/order.controller');

// Apply authentication to all order routes
router.use(authenticateToken);

// Create a new order
router.post('/', createOrder);

// Search orders with filters
router.get('/search', searchOrders);

// Get all orders for the authenticated user
router.get('/', getUserOrders);

// Get a specific order's details
router.get('/:id', getOrderDetails);

// Reorder a previous order
router.put('/:orderId', reoder);

module.exports = router; 