const express = require("express");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const path = require('path'); // Add path module
const app = express();
const authRoutes = require('./routes/auth.routes', './routes/user.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const shippingAddressRoutes = require('./routes/shippingAddress.routes');
const orderRoutes = require('./routes/order.routes');
const webhookRoutes = require('./routes/webhook.routes');

// Configurar CORS
app.use(cors({
  origin: "*", // Permitir peticiones desde el frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos'
});

// IMPORTANT: Register webhook routes BEFORE body parser middleware
// This ensures webhook requests are handled with raw body data
app.use('/api/webhooks', webhookRoutes);

// Middlewares básicos - applied to all routes EXCEPT webhooks
app.use(express.json());
app.use(limiter);
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Regular API routes - these will have parsed JSON bodies
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/shipping-address', shippingAddressRoutes);
app.use('/api/orders', orderRoutes);

// Rutas de ejemplo
app.get("/", (req, res) => {
  res.send("Backend funcionando ✅");
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
