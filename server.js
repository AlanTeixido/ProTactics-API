const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const postsRoutes = require("./routes/posts");
const entrenamientosRoutes = require("./routes/entrenamientos"); 
const progresoEntrenamientosRoutes = require("./routes/progresoEntrenamientos");
const historialEntrenamientosRoutes = require("./routes/historialEntrenamientos");
const logsActividadesRoutes = require("./routes/logsActividades");


const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/posts", postsRoutes);
app.use("/entrenamientos", entrenamientosRoutes); 
app.use("/progreso_entrenamientos", progresoEntrenamientosRoutes);
app.use("/historial_entrenamientos", historialEntrenamientosRoutes);
app.use("/logs_actividades", logsActividadesRoutes);


app.get("/", (req, res) => {
    res.send("🔥 API de ProTactics en funcionamiento!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor en marcha en http://localhost:${PORT}`));
