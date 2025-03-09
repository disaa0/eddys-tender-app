const express = require('express');
const router = express.Router();
const { addItemToCart } = require('../controllers/cart.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateAddItemToCart } = require('../middlewares/validateInput');

router.put('/items/:idProduct', authenticateToken, validateAddItemToCart, addItemToCart);

module.exports = router;
