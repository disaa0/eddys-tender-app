const express = require("express");
const rateLimit = require('express-rate-limit');
const app = express();
const authRoutes = require('./routes/auth.routes');

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos'
});

// Middlewares básicos
app.use(express.json());
app.use(limiter); // Apply rate limiting to all routes

//Rutas
app.use('/api/auth', authRoutes);

// Rutas de ejemplo
app.get("/", (req, res) => {
  res.send("Backend funcionando ✅");
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
