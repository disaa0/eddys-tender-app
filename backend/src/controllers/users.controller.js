const { getUserById } = require('../services/user.service');

// Obtener el usuario autenticado
async function getAuthenticatedUser(req, res) {
    try {
        const user = await getUserById(req.user.userId); // ID obtenido del token
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
    }
}

module.exports = { getAuthenticatedUser };
