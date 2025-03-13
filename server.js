const express = require("express");
const cors = require("cors");

// 🔹 Importació de les rutes
const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const postsRoutes = require("./routes/posts");
const entrenamientosRoutes = require("./routes/entrenamientos");
const progresoEntrenamientosRoutes = require("./routes/progresoEntrenamientos");
const historialEntrenamientosRoutes = require("./routes/historialEntrenamientos");
const logsActividadesRoutes = require("./routes/logsActividades");
const userStatsRoutes = require("./routes/userStats");
const activityFeedRoutes = require("./routes/activityFeed");
const seguimientosRoutes = require('./routes/seguimientos'); 


const app = express();

// 🔹 Middleware
app.use(express.json()); // Per treballar amb JSON
app.use(cors()); // Permet peticions des del frontend

// 🔹 Assignació de rutes
app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/posts", postsRoutes);
app.use("/entrenamientos", entrenamientosRoutes);
app.use("/progreso_entrenamientos", progresoEntrenamientosRoutes);
app.use("/historial_entrenamientos", historialEntrenamientosRoutes);
app.use("/logs_actividades", logsActividadesRoutes);
app.use("/user_stats", userStatsRoutes);
app.use("/activity_feed", activityFeedRoutes);
app.use('/seguimientos', seguimientosRoutes); 


// 🔹 Ruta principal per comprovar el funcionament de l'API
app.get("/", (req, res) => {
    res.send("🔥 API de ProTactics en funcionament!");
});

// 🔹 Arrencada del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor en marxa a http://localhost:${PORT}`));
