const express = require('express');
const router = express.Router();
const { addItemToCart, addOneItemToCart, softDeleteItemFromCart, getItemsCart, getTotalAmountCart, getItemsQuantityCart } = require('../controllers/cart.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateAddItemToCart, validateAddOneItemToCart } = require('../middlewares/validateInput');

router.put('/items/addOneItem/:idProduct', authenticateToken, validateAddOneItemToCart, addOneItemToCart);
router.put('/items/:idProduct', authenticateToken, validateAddItemToCart, addItemToCart);
router.delete('/items/:idProduct', authenticateToken, softDeleteItemFromCart)
router.get('/', authenticateToken, getItemsCart);
router.get('/total', authenticateToken, getTotalAmountCart);
router.get('/quantity', authenticateToken, getItemsQuantityCart);

module.exports = router;
