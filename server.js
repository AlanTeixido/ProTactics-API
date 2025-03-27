const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Carga las variables del .env

const app = express();

// 🔹 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch((err) => console.error("❌ Error al conectar a MongoDB:", err));

// 🔹 Middleware
app.use(express.json());
app.use(cors());

// 🔹 Importación de rutas
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const entrenamientosRoutes = require("./routes/entrenamientos");
const progresoEntrenamientosRoutes = require("./routes/progresoEntrenamientos");
const historialEntrenamientosRoutes = require("./routes/historialEntrenamientos");
const logsActividadesRoutes = require("./routes/logsActividades");
const userStatsRoutes = require("./routes/userStats");
const activityFeedRoutes = require("./routes/activityFeed");
const seguimientosRoutes = require('./routes/seguimientos');
const entrenadoresRoutes = require('./routes/entrenadores');
const clubsRoutes = require('./routes/clubs');

// 🔹 Rutas de la API
app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/entrenamientos", entrenamientosRoutes);
app.use("/progreso_entrenamientos", progresoEntrenamientosRoutes);
app.use("/historial_entrenamientos", historialEntrenamientosRoutes);
app.use("/logs_actividades", logsActividadesRoutes);
app.use("/user_stats", userStatsRoutes);
app.use("/activity_feed", activityFeedRoutes);
app.use("/seguimientos", seguimientosRoutes);
app.use("/entrenadores", entrenadoresRoutes);
app.use("/clubes", clubsRoutes);

// 🔹 Ruta principal
app.get("/", (req, res) => {
    res.send("🔥 API de ProTactics funcionando!");
});

// 🔹 Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
