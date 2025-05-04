const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt.config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function authenticateToken(req, res, next) {
  try {
    // console.log('Authenticating token for:', req.originalUrl);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log('Decoded token:', decoded);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { idUser: decoded.userId },
    });

    if (!user || !user.status) {
      console.log('User not found or inactive:', decoded.userId);
      return res.status(401).json({
        message: 'Usuario no encontrado o cuenta desactivada',
      });
    }

    // Make sure both userId and idUser are available in the request
    // This ensures compatibility with different code patterns
    req.user = {
      ...decoded,
      idUser: decoded.userId, // Add idUser that matches with the database field
      userId: decoded.userId, // Ensure userId is present
    };

    // console.log('Authentication successful for user:', req.user.userId);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(403).json({ message: 'Token inválido' });
  }
}

function isAdmin(req, res, next) {
  if (req.user.userType !== 1) {
    return res
      .status(403)
      .json({ message: 'Acceso denegado: Solo administradores' });
  }
  next();
}

module.exports = { authenticateToken, isAdmin };
