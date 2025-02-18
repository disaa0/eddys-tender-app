const crypto = require('crypto');

// Usar una clave fija en desarrollo (32 bytes = 256 bits)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-256-bit-secret'.repeat(2);
const IV_LENGTH = 16; // Para AES, siempre 16 bytes

function encrypt(text) {
    try {
        // Generar IV aleatorio
        const iv = crypto.randomBytes(IV_LENGTH);

        // Crear cipher con clave y IV
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            Buffer.from(ENCRYPTION_KEY),
            iv
        );

        // Encriptar
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Retornar IV + texto encriptado
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Error al encriptar');
    }
}

function decrypt(text) {
    try {
        // Separar IV y texto encriptado
        const [ivHex, encryptedHex] = text.split(':');
        if (!ivHex || !encryptedHex) {
            throw new Error('Formato de texto encriptado inválido');
        }

        // Convertir de hex a Buffer
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');

        // Crear decipher
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(ENCRYPTION_KEY),
            iv
        );

        // Desencriptar
        let decrypted = decipher.update(encrypted, 'buffer', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Error al desencriptar');
    }
}

module.exports = {
    encrypt,
    decrypt,
    ENCRYPTION_KEY
}; 