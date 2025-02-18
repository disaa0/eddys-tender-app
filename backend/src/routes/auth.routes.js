const express = require('express');

const { register, login } = require('../controllers/auth.controller');
const { validateRegister } = require('../middlewares/validateInput');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', login);

router.post('/register', validateRegister, register);

// Example of a protected route
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;