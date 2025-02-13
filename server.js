require('dotenv').config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth"); 
const usuariosRoutes = require("./routes/usuarios");
const editUserRoutes = require("./routes/edituser");
const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Registre de rutes
app.use("/auth", authRoutes); // Rutes d'autenticació
app.use("/usuarios", usuariosRoutes); // Rutes de gestió d'usuaris
app.use("/edituser", editUserRoutes); // ✅ Rutes per editar perfil

app.get("/", (req, res) => {
    res.send("🔥 API de ProTactics en funcionament!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor en marxa a http://localhost:${PORT}`));
