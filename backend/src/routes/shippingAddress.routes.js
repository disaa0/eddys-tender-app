const express = require('express');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware.js');
const { createShippingAddress, getUserShippingAddress } = require("../controllers/shippingAddress.controller.js");
const { validateShippingAddress } = require("../middlewares/validateInput.js");


const router = express.Router();

// Ruta para añadir una dirección (accesible solo para usuarios autenticados)
router.post("/", authenticateToken, validateShippingAddress, createShippingAddress);
router.get("/", authenticateToken, getUserShippingAddress);

module.exports = router;