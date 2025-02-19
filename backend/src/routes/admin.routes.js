const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');
const { toggleProductStatus, updateProductCustomization } = require('../controllers/admin.controller');
const { validateCustomization } = require('../middlewares/validateInput');

const router = express.Router();

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authenticateToken, isAdmin);

// Activar/Desactivar producto
router.patch('/products/:id/status', toggleProductStatus);

// Editar personalización
router.put('/products/:id/customization', validateCustomization, updateProductCustomization);

module.exports = router; 