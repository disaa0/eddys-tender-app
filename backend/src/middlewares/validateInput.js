const { z } = require('zod');

// Definir esquema de validación para registro
const registerSchema = z.object({
    username: z.string()
        .min(3, { message: "Nombre de usuario debe contener al menos 3 caracteres" })
        .max(16, { message: "Nombre de usuario no puede tener más de 16 caracteres" }),
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

const customizationSchema = z.object({
    name: z.string().min(1, { message: "El nombre de la personalización es requerido" }),
    status: z.boolean(),
    // Agregar más campos según necesidades
});

const validateCustomization = (req, res, next) => {
    const result = customizationSchema.safeParse(req.body);
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
    status: z.boolean(),
    imagePath: z.string().optional()
});

const productDetailsSchema = z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    price: z.number().positive().or(z.string().regex(/^\d+\.?\d{0,2}$/).transform(Number)).optional(),
    idProductType: z.number().positive().optional(),
    status: z.boolean().optional(),
    imagePath: z.string().optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "Al menos un campo debe ser proporcionado para actualizar"
});

const validateAddItemToCart = (req, res, next) => {
    const schema = z.object({
        idProduct: z.string().regex(/^\d+$/, "El id del producto debe ser un número entero").transform(Number).refine(val => val > 0, {
            message: "El id del producto debe ser un número entero mayor que 0"
        }),
        quantity: z.number().int().min(1, "La cantidad debe ser al menos 1").max(30, "La cantidad no puede ser mayor a 30")
    });

    try {
        const validatedData = schema.parse({
            idProduct: req.params.idProduct,
            quantity: req.body.quantity
        });

        req.validatedData = validatedData;
        next();
    } catch (error) {
        return res.status(400).json({ message: "Error de validación", errors: error.errors });
    }
};

const validateAddOneItemToCart = (req, res, next) => {
    const schema = z.object({
        idProduct: z.string().regex(/^\d+$/, "El id del producto debe ser un número entero").transform(Number).refine(val => val > 0, {
            message: "El id del producto debe ser un número entero mayor que 0"
        }),
    });

    try {
        const validatedData = schema.parse({
            idProduct: req.params.idProduct,
        });

        req.validatedData = validatedData;
        next();
    } catch (error) {
        return res.status(400).json({ message: "Error de validación", errors: error.errors });
    }
};

const validateDeleteItemFromCart = (req, res, next) => {
    const schema = z.object({
        idProduct: z.number().int().positive("El ID del producto debe ser un número entero positivo"),
    });

    const result = schema.safeParse({ idProduct: Number(req.params.idProduct) });

    if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
    }

    next();
};

const searchQuerySchema = z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    minPrice: z.string()
        .refine(val => !val || !isNaN(val), "El precio mínimo debe ser un número")
        .refine(val => !val || parseFloat(val) >= 0, "El precio mínimo debe ser positivo")
        .optional(),
    maxPrice: z.string()
        .refine(val => !val || !isNaN(val), "El precio máximo debe ser un número")
        .refine(val => !val || parseFloat(val) >= 0, "El precio máximo debe ser positivo")
        .optional(),
    status: z.enum(['true', 'false']).optional(),
    page: z.string()
        .refine(val => !val || (!isNaN(val) && parseInt(val) > 0), "La página debe ser un número positivo")
        .optional(),
    limit: z.string()
        .refine(val => !val || (!isNaN(val) && parseInt(val) > 0), "El límite debe ser un número positivo")
        .optional()
}).refine(data => {
    if (data.minPrice && data.maxPrice) {
        return parseFloat(data.maxPrice) >= parseFloat(data.minPrice);
    }
    return true;
}, {
    message: "El precio máximo debe ser mayor o igual al precio mínimo"
});

const validateSearchQuery = (req, res, next) => {
    const result = searchQuerySchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            message: "Parámetros de búsqueda inválidos",
            errors: result.error.format()
        });
    }
    next();
};

const shippingAddressSchema = z.object({
    street: z.string().max(100, "Calle demasiado larga"),
    houseNumber: z.string().regex(/^[\dA-Za-z\-\/]{1,10}$/, "El número de casa debe ser alfanumérico con un máximo de 10 caracteres"),
    postalCode: z.string().regex(/^\d{5}$/, "El código postal debe tener exactamente 5 dígitos y ser numérico"),
    neighborhood: z.string().max(50, "Vecindario demasiado largo"),
});

function validateShippingAddress(req, res, next) {
    try {
        req.body = shippingAddressSchema.parse(req.body);
        next();
    } catch (error) {
        res.status(400).json({ error: error.errors });
    }
}

const validateIdParam = (req, res, next) => {
    const schema = z.object({
        id: z.number().int().positive("El ID debe ser un número entero positivo"),
    });

    const result = schema.safeParse({ id: Number(req.params.id) });

    if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
    }

    next();
};

const addItemToCartSchemaWithPersonzalization = z.object({
    quantity: z
        .number({ invalid_type_error: "La cantidad debe ser un número" })
        .int("La cantidad debe ser un número entero")
        .positive("La cantidad debe ser mayor que 0"),

    personalizations: z
        .array(
            z.number({ invalid_type_error: "Cada personalización debe ser un número" })
                .int("Cada personalización debe ser un número entero")
        )
        .optional()
        .refine(val => val === undefined || Array.isArray(val), {
            message: "Personalizations debe ser una lista",
        }),
});

const idProductParamSchema = z.object({
    id: z.string().regex(/^\d+$/, "El ID del producto debe ser un número entero"),
});

const validateAddItemToCartWithPersonalzations = (req, res, next) => {
    try {
        const parsedParams = idProductParamSchema.parse(req.params);
        req.params.id = Number(parsedParams.id); // Convertir a número entero

        const parsedBody = addItemToCartSchemaWithPersonzalization.parse(req.body);
        req.body = {
            quantity: parsedBody.quantity,
            personalizations: parsedBody.personalizations || [],
        };

        next();
    } catch (error) {
        res.status(400).json({ error: error.errors });
    }
}

const validateQueryProductIds = (req, res, next) => {
    const schema = z.object({
        product_id: z.union([
            z.string().regex(/^\d+$/),
            z.array(z.string().regex(/^\d+$/))
        ])
    });

    const parsed = schema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Parámetros inválidos: product_id debe ser uno o más IDs numéricos",
            errors: parsed.error.errors
        });
    }

    // Normalizamos los IDs a array de enteros
    req.productIds = Array.isArray(req.query.product_id)
        ? req.query.product_id.map(id => parseInt(id))
        : [parseInt(req.query.product_id)];

    next();
};

module.exports = {
    validateRegister,
    validatePasswordUpdate,
    validateEmailUpdate,
    validateCustomization,
    productSchema, productDetailsSchema, validateAddItemToCart, validateDeleteItemFromCart,
    validateSearchQuery, validateShippingAddress, validateIdParam, validateAddOneItemToCart,
    validateAddItemToCartWithPersonalzations,
    validateQueryProductIds
};
