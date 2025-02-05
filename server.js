require("dotenv").config({ path: './.env' });
require('dotenv').config();
const express = require('express');
const cors = require('cors');

console.log("🌍 Configuració Cloudinary:");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET);

const app = express();
app.use(express.json());
app.use(cors()); // Permet crides des del frontend

// Importar rutes
const usuariosRoutes = require('./routes/usuarios'); 
const authRoutes = require('./routes/auth'); 

app.use('/usuarios', usuariosRoutes); // Map "/usuarios"
app.use('/auth', authRoutes); // Map "/auth"

// Ruta principal per comprovar que l'API funciona
app.get('/', (req, res) => {
    res.json({ message: "🚀 API de ProTactics funcionant correctament!" });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor executant-se a http://localhost:${PORT}`));
