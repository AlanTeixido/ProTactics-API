require('dotenv').config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth"); 
const editUserRoutes = require("./routes/edituser"); // 🔹 Nou arxiu
const usuariosRoutes = require("./routes/usuarios");

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Registre de rutes
app.use("/auth", authRoutes); 
app.use("/usuarios", editUserRoutes); // 🔹 Rutes per editar usuari

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor en marxa a http://localhost:${PORT}`));
