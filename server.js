const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Para leer .env

// 🔹 Importación de rutas
const authRoutes = require("./routes/auth");
const clubsRoutes = require("./routes/clubs");
const entrenadoresRoutes = require("./routes/entrenadores");
const jugadoresRoutes = require("./routes/jugadores");
const publicacionesRoutes = require("./routes/publicaciones"); 

const app = express();

// 🔹 Configuración CORS para permitir solicitudes solo desde localhost:5173
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔹 Rutas de la API
app.use("/auth", authRoutes);
app.use("/clubes", clubsRoutes);
app.use("/entrenadores", entrenadoresRoutes);
app.use("/jugadores", jugadoresRoutes);
app.use("/publicaciones", publicacionesRoutes); 

// 🔹 Ruta raíz para verificar que la API funciona
app.get("/", (req, res) => {
  res.send("🚀 API de ProTactics operativa!");
});

// 🔹 Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
