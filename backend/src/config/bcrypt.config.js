const bcrypt = require("bcryptjs");

const shouldEncrypt = process.env.USE_PASSWORD_ENCRYPTION === "true";
const saltRounds = 10;

// Función para encriptar la contraseña
async function hashPassword(password) {

    if (!shouldEncrypt) {
        return password; // En desarrollo, devuelve la contraseña sin encriptar
    }
    return await bcrypt.hash(password, saltRounds);
}

// Función para comparar contraseñas
async function comparePassword(inputPassword, storedPassword) {

    const isStoredHashed = storedPassword.length === 60 && storedPassword.startsWith("$2");

    // Si la encriptación está deshabilitada, compara sin bcrypt
    if (!shouldEncrypt) {
        return inputPassword === storedPassword;
    }

    // Si la encriptación está activada y la contraseña almacenada está hasheada, usar bcrypt
    if (isStoredHashed) {
        return await bcrypt.compare(inputPassword, storedPassword);
    }

    // Si la encriptación está activada pero la contraseña almacenada NO está hasheada, compara directo
    return inputPassword === storedPassword;
}


module.exports = { hashPassword, comparePassword }