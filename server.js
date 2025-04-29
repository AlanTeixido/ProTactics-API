const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Leer variables .env

// 🔹 Importación de rutas
const authRoutes = require("./routes/auth");
const clubsRoutes = require("./routes/clubs");
const entrenadoresRoutes = require("./routes/entrenadores");
const jugadoresRoutes = require("./routes/jugadores");
const publicacionesRoutes = require("./routes/publicaciones");
const usuariosRoutes = require("./routes/usuarios");
const equiposRoutes = require("./routes/equipos");
const entrenamientosRoutes = require("./routes/entrenamientos");
const chatbotRoutes = require("./routes/chatBot");

const app = express();

// ✅ Middleware CORS (producción + desarrollo)
const allowedOrigins = [
  'http://localhost:5173',
  'https://alanverse.netlify.app' // Añade tu dominio aquí
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🌍 Solicitud desde:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Permitir
    } else {
      callback(new Error('❌ CORS: Origen no permitido'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Si usas cookies o auth tokens
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔹 Rutas API
app.use("/auth", authRoutes);
app.use("/clubes", clubsRoutes);
app.use("/entrenadores", entrenadoresRoutes);
app.use("/jugadores", jugadoresRoutes);
app.use("/publicaciones", publicacionesRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/equipos", equiposRoutes);
app.use("/entrenamientos", entrenamientosRoutes);
app.use("/api/chatbot", chatbotRoutes);


// 🔹 Ruta raíz para test
app.get("/", (req, res) => {
  res.send("🚀 API de ProTactics operativa!");
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
