const express = require("express");
const app = express();
const authRoutes = require('./routes/auth.routes');


// Middlewares básicos
app.use(express.json());

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
