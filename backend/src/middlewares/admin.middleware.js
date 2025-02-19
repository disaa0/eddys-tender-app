async function isAdmin(req, res, next) {
    try {
        // Verificar si el usuario es administrador (idUserType === 1)
        if (req.user.userType !== 1) {
            return res.status(403).json({
                message: 'Acceso denegado. Se requieren permisos de administrador.'
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar permisos de administrador' });
    }
}

module.exports = { isAdmin }; 