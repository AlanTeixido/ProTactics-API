require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // ❗ FALTA IMPORTAR ESTO

const app = express();
app.use(express.json());
app.use(cors()); // Permite llamadas desde el frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir imágenes de perfil

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
