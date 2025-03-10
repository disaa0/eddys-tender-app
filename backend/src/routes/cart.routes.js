const express = require('express');
const router = express.Router();
const { addItemToCart, softDeleteItemFromCart, getItemsCart, getTotalAmountCart } = require('../controllers/cart.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateAddItemToCart } = require('../middlewares/validateInput');

router.put('/items/:idProduct', authenticateToken, validateAddItemToCart, addItemToCart);
router.delete('/items/:idProduct', authenticateToken, softDeleteItemFromCart)
router.get('/', authenticateToken, getItemsCart);
router.get('/total', authenticateToken, getTotalAmountCart);

module.exports = router;
