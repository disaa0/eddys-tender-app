const express = require('express');
const router = express.Router();
const { addItemToCart, addOneItemToCart, addOneItemToCartPersonalizations, softDeleteItemFromCart, getItemsCart, getTotalAmountCart, getItemsQuantityCart, disableCart, getCartById, getCartsByUser, getLastItemCartForProduct } = require('../controllers/cart.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateAddItemToCart, validateAddOneItemToCart } = require('../middlewares/validateInput');

router.put('/items/addOneItem/:idProduct', authenticateToken, validateAddOneItemToCart, addOneItemToCart);
router.put('/items/new/:idProduct', authenticateToken, validateAddOneItemToCart, addOneItemToCartPersonalizations);
router.get('/items/last/:idProduct', authenticateToken, getLastItemCartForProduct);
router.put('/items/:idProduct', authenticateToken, validateAddItemToCart, addItemToCart);
router.delete('/items/:idProduct', authenticateToken, softDeleteItemFromCart)
router.get('/', authenticateToken, getItemsCart);
router.get('/total', authenticateToken, getTotalAmountCart);
router.get('/quantity', authenticateToken, getItemsQuantityCart);
router.put('/disable', authenticateToken, disableCart);
router.get('/user', authenticateToken, getCartsByUser);
router.get('/:cartId', authenticateToken, getCartById);

module.exports = router;
