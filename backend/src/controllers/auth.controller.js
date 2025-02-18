const authService = require('../services/auth.service');

async function register(req, res) {
    try {
        const { email, password, username, name, lastName, secondLastName, phone, idUserType } = req.body;
        const user = await authService.registerUser(email, password, username, name, lastName, secondLastName, phone/*, idUserType*/);
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
        res.status(400).json({ message: error.message });
    }
}

async function deleteProfile(req, res) {
    try {
        const userId = req.user.userId;
        const result = await authService.deleteUserProfile(userId);
        res.status(200).json(result);
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

module.exports = {
    register,
    login,
    deleteProfile,
    updatePassword
};