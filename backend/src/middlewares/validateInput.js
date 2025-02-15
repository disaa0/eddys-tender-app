const { z } = require('zod');

// Definir esquema de validación para registro
const registerSchema = z.object({
    username: z.string().min(3, { message: "Nombre de usuario no puede estar vacío y debe contener almenos 3 caracteres" }),
    email: z.string().email({ message: "Correo no válido" }),
    password: z.string()
        .min(6, { message: "Contraseña debe tener al menos 6 caracteres" })
        .regex(/^(?=.*[A-Z])/, { message: "Contraseña debe tener al menos 1 mayúscula" })
        .regex(/^(?=.*[a-z])/, { message: "Contraseña debe tener al menos 1 minúscula" })
        .regex(/^(?=.*\d)/, { message: "Contraseña debe tener al menos 1 número" })
        .regex(/^(?=.*[@$!%*?&])/, { message: "Contraseña debe tener al menos 1 carácter especial (@$!%*?&)" }),
    phone: z.string()
        .length(10, { message: 'El número de teléfono debe tener exactamente 10 dígitos' })
        .regex(/^\d{10}$/, { message: 'El número de teléfono debe contener solo números' }),
    name: z.string().min(1, { message: "Nombre no puede estar vacío" }),
    lastName: z.string().min(1, { message: "Apellido paterno no puede estar vacío" }),
    idUserType: z.union([
        z.literal(1),
        z.literal(2),
        z.undefined(), // Permite que sea opcional
    ]).optional()
});

// Middleware de validación
const validateRegister = (req, res, next) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }

    next();
};

module.exports = { validateRegister };
