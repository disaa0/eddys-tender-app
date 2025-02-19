const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt.config');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

function isAdmin(req, res, next) {

    if (req.user.userType !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo administradores' });
    }
    next();
}


module.exports = { authenticateToken, isAdmin }; 