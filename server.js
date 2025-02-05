require('dotenv').config();
const express = require('express');
const cors = require('cors');
require("dotenv").config();

console.log("🌍 Cloudinary Config des de auth.js:");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET);


const app = express();
app.use(express.json());
app.use(cors()); // Permite llamadas desde el frontend

// Importar rutas
const usuariosRoutes = require('./routes/usuarios'); 
const authRoutes = require('./routes/auth'); 

app.use('/usuarios', usuariosRoutes); // Mapea "/usuarios" a usuarios.js
app.use('/auth', authRoutes); // Mapea "/auth" a auth.js

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.json({ message: "API de ProTactics funcionando 🚀" });
});

app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
