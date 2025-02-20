const express = require('express');
const { getAuthenticatedUser } = require('../controllers/users.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Obtener información del usuario autenticado (desde el token)
router.get('/profile', authenticateToken, getAuthenticatedUser);

module.exports = router;