const authService = require('../services/auth.service');

async function register(req, res) {
    try {
        const { email, password, username, name, lastName, secondLastName, phone } = req.body;
        const idUserType = 2; // Para registro de usuarios clientes
        const user = await authService.registerUserService(email, password, username, name, lastName, secondLastName, phone, idUserType);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function registerAdmin(req, res) {
    try {
        const { email, password, username, name, lastName, secondLastName, phone, idUserType } = req.body;
        const user = await authService.registerUserService(email, password, username, name, lastName, secondLastName, phone, idUserType);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function login(req, res) {
    try {
        const { email, username, password } = req.body;
        const result = await authService.loginUser(email, username, password);
        res.status(200).json({
            message: 'Login exitoso',
            ...result
        });
    } catch (error) {
        let status = 400;
        let message = error.message;

        // Customize error messages based on the error
        switch (error.message) {
            case 'Usuario no encontrado':
                message = 'El usuario no existe';
                break;
            case 'Cuenta desactivada':
                status = 403;
                message = 'Esta cuenta ha sido desactivada. Por favor contacta a soporte.';
                break;
            case 'Contraseña incorrecta':
                message = 'La contraseña es incorrecta';
                break;
            default:
                message = 'Error al iniciar sesión';
        }

        res.status(status).json({ message });
    }
}

async function deleteProfile(req, res) {
    try {
        const userId = req.user.userId;
        const result = await authService.deleteUserProfile(userId);
        res.status(200).json({
            message: 'Cuenta eliminada exitosamente'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function updatePassword(req, res) {
    try {
        const userId = req.user.userId;
        const { oldPassword, newPassword } = req.body;
        const result = await authService.updatePassword(userId, oldPassword, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

//updateEmail

async function updateEmail(req, res) {
    try {
        const userId = req.user.userId;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'El correo electrónico es requerido' });
        }

        const result = await authService.updateEmail(userId, email);
        res.status(200).json({
            message: 'Correo electrónico actualizado exitosamente',
            user: result
        });
    } catch (error) {
        // Handle specific error cases
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Este correo electrónico ya está en uso' });
        }
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    register,
    registerAdmin,
    login,
    deleteProfile,
    updatePassword,
    updateEmail
};