const express = require('express');

const { register, login, deleteProfile, updatePassword, updateEmail } = require('../controllers/auth.controller');
const { validateRegister, validatePasswordUpdate, validateEmailUpdate } = require('../middlewares/validateInput');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', login);

router.post('/register', validateRegister, register);

// Example of a protected route
// router.get('/profile', authenticateToken, (req, res) => {
//     res.json({ user: req.user });
// });

// Nuevas rutas
router.delete('/profile', authenticateToken, deleteProfile);
router.put('/password', authenticateToken, validatePasswordUpdate, updatePassword);
router.put('/email', authenticateToken, validateEmailUpdate, updateEmail);


// router.get('/profile', authenticateToken, (req, res) => {
//     res.json({ user: req.user });
// });

module.exports = router;