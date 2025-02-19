const { z } = require('zod');

// Definir esquema de validación para registro
const registerSchema = z.object({
    username: z.string()
        .min(3, { message: "Nombre de usuario debe contener al menos 3 caracteres" })
        .max(12, { message: "Nombre de usuario no puede tener más de 12 caracteres" }),
    email: z.string().email({ message: "Correo no válido" }),
    password: z.string()
        .min(6, { message: "Contraseña debe tener al menos 6 caracteres" })
        .regex(/[A-Z]/, { message: "Contraseña debe tener al menos 1 mayúscula" })
        .regex(/[a-z]/, { message: "Contraseña debe tener al menos 1 minúscula" })
        .regex(/\d/, { message: "Contraseña debe tener al menos 1 número" })
        .regex(/[@$!%*?&]/, { message: "Contraseña debe tener al menos 1 carácter especial (@$!%*?&)" }),
    phone: z.string()
        .length(10, { message: 'El número de teléfono debe tener exactamente 10 dígitos' })
        .regex(/^\d{10}$/, { message: 'El número de teléfono debe contener solo números' }),
    name: z.string().min(1, { message: "Nombre no puede estar vacío" }),
    lastName: z.string()
        .min(1, { message: "Apellido paterno no puede estar vacío" })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/, { message: "Solo se permiten letras en el apellido paterno" }),
    secondLastName: z.string()
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/, { message: "Solo se permiten letras en el apellido materno" }).optional(),

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

    // Convertir campos a mayúsculas
    req.body.name = req.body.name.toUpperCase();
    req.body.lastName = req.body.lastName.toUpperCase();
    if (req.body.secondLastName) {
        req.body.secondLastName = req.body.secondLastName.toUpperCase();
    }

    next();
};

const passwordUpdateSchema = z.object({
    oldPassword: z.string().min(1, { message: "Contraseña actual requerida" }),
    newPassword: z.string()
        .min(6, { message: "Nueva contraseña debe tener al menos 6 caracteres" })
        .regex(/[A-Z]/, { message: "Nueva contraseña debe tener al menos 1 mayúscula" })
        .regex(/[a-z]/, { message: "Nueva contraseña debe tener al menos 1 minúscula" })
        .regex(/\d/, { message: "Nueva contraseña debe tener al menos 1 número" })
        .regex(/[@$!%*?&]/, { message: "Nueva contraseña debe tener al menos 1 carácter especial (@$!%*?&)" })
});

const validatePasswordUpdate = (req, res, next) => {
    const result = passwordUpdateSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }
    next();
};

const validateEmailUpdate = (req, res, next) => {
    const emailUpdateSchema = z.object({
        email: z.string().email({ message: "Correo no válido" })
    });

    const result = emailUpdateSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }
    next();
};

//validacion de producto
const productSchema = z.object({
    idProductType: z.number().int().positive({ message: "El idProductType debe ser un número positivo" }),
    name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
    description: z.string().min(3, { message: "La descripcion no debe esta vacia" }),
    price: z.number().positive({ message: "El precio debe ser un número positivo" }),
    status: z.boolean()
});


module.exports = {
    validateRegister,
    validatePasswordUpdate,
    validateEmailUpdate,
    productSchema
};
