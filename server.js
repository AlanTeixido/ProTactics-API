require('dotenv').config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth"); 
const passwordRoutes = require("./routes/password");  // 🔹 Aquí es defineix correctament
const usuariosRoutes = require("./routes/usuarios");

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 Registre de rutes
app.use("/auth", authRoutes); // Rutes d'autenticació
app.use("/password", passwordRoutes); // Rutes de canvi de contrasenya
app.use("/usuarios", usuariosRoutes); // Rutes de gestió d'usuaris

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor en marxa a http://localhost:${PORT}`));

