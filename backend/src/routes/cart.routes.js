const express = require('express');
const router = express.Router();
const { addItemToCart, addOneItemToCart, addItemToCartPersonalized, softDeleteItemFromCart, getItemsCart, getTotalAmountCart, getItemsQuantityCart, disableCart, getCartById, getCartsByUser, getLastItemCartForProduct } = require('../controllers/cart.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateAddItemToCart, validateAddOneItemToCart, validateAddItemToCartWithPersonalzations } = require('../middlewares/validateInput');

router.put('/items/addOneItem/:idProduct', authenticateToken, validateAddOneItemToCart, addOneItemToCart);
router.put('/items/new/:id', authenticateToken, validateAddItemToCartWithPersonalzations, addItemToCartPersonalized);
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
