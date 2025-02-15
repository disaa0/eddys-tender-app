const express = require('express');

const { register, login } = require('../controllers/auth.controller');
const { validateRegister } = require('../middlewares/validateInput');

const router = express.Router();

router.post('/login', login);

router.post('/register', validateRegister, register);

module.exports = router;