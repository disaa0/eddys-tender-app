const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage to use memory storage (temporary)
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, webp, gif)'), false);
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

// Process image using Sharp and convert to JPG
const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const productId = req.params.id;
        const outputFilename = `product-${productId}.jpg`;
        const outputPath = path.join(uploadDir, outputFilename);

        // Process with Sharp: resize and convert to jpg format
        await sharp(req.file.buffer)
            .resize(800) // Resize to max width of 800px (maintains aspect ratio)
            .jpeg({ quality: 85 }) // Convert to JPG with 85% quality
            .toFile(outputPath);

        // Update the file information in the request
        req.file.filename = outputFilename;
        req.file.path = outputPath;
        
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Error al procesar la imagen",
            error: error.message
        });
    }
};

// Wrapper to handle multer errors and process image
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
        
        // Process image before continuing
        processImage(req, res, next);
    });
};

module.exports = {
    handleProductImageUpload
}; 
