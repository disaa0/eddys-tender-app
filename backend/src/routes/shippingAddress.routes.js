const express = require('express');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware.js');
const { createShippingAddress, getUserShippingAddress, getAllUserShippingAddresses, updateShippingAddress, deleteShippingAddress } = require("../controllers/shippingAddress.controller.js");
const { validateShippingAddress, validateIdParam } = require("../middlewares/validateInput.js");

const router = express.Router();

// Rutas para direcciones (accesibles solo para usuarios autenticados)
router.post("/", authenticateToken, validateShippingAddress, createShippingAddress);
router.get("/", authenticateToken, getAllUserShippingAddresses);
router.get("/single", authenticateToken, getUserShippingAddress);

// Rutas para actualizar y eliminar direcciones
router.put("/:id", authenticateToken, validateIdParam, validateShippingAddress, updateShippingAddress);
router.delete("/:id", authenticateToken, validateIdParam, deleteShippingAddress);

module.exports = router;