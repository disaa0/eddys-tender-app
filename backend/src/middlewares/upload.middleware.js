const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use the product ID for the filename
        const productId = req.params.id;
        const ext = path.extname(file.originalname);
        cb(null, `product-${productId}${ext}`);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, webp)'), false);
    }
};

// Create the multer upload instance with specific field name
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single('productImage');

// Wrapper to handle multer errors
const handleProductImageUpload = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                message: "Error al subir la imagen",
                error: err.message,
                details: "Asegúrate de usar el campo 'productImage' en el form-data"
            });
        } else if (err) {
            return res.status(400).json({
                message: "Error al subir la imagen",
                error: err.message
            });
        }
        next();
    });
};

module.exports = {
    handleProductImageUpload
}; 