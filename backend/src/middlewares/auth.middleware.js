const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt.config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user still exists and is active
        const user = await prisma.user.findUnique({
            where: { idUser: decoded.userId }
        });

        if (!user || !user.status) {
            return res.status(401).json({
                message: 'Usuario no encontrado o cuenta desactivada'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        return res.status(403).json({ message: 'Token inválido' });
    }
}

function isAdmin(req, res, next) {

    if (req.user.userType !== 1) {
        return res.status(403).json({ message: 'Acceso denegado: Solo administradores' });
    }
    next();
}


module.exports = { authenticateToken, isAdmin }; 