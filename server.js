const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Para leer .env

// 🔹 Importación de rutas
const authRoutes = require("./routes/auth");
const clubsRoutes = require("./routes/clubs");
const entrenadoresRoutes = require("./routes/entrenadores");

const app = express();

// 🔹 Configuración CORS para permitir solicitudes solo desde localhost:5173
const corsOptions = {
  origin: 'http://localhost:5173',  // Especifica tu frontend aquí
  methods: 'GET, POST, PUT, DELETE',  // Métodos permitidos
  allowedHeaders: 'Content-Type, Authorization',  // Cabeceras permitidas
};

app.use(cors(corsOptions));  // Aplica la configuración de CORS
app.use(express.json());

// 🔹 Rutas de la API
app.use("/auth", authRoutes);                  // Login y registro para club/entrenador
app.use("/clubes", clubsRoutes);               // Gestión de clubes
app.use("/entrenadores", entrenadoresRoutes);  // Gestión de entrenadores

// 🔹 Ruta raíz para verificar que la API funciona
app.get("/", (req, res) => {
  res.send("🚀 API de ProTactics operativa!");
});

// 🔹 Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
