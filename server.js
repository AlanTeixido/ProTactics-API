const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Per llegir .env

// 🔹 Importació de rutes
const authRoutes = require("./routes/auth");
const clubsRoutes = require("./routes/clubs");
const entrenadoresRoutes = require("./routes/entrenadores");
// 🔜 Aquí pots afegir més rutes en el futur (posts, entrenamientos, etc.)

const app = express();

// 🔹 Middleware global
app.use(cors());
app.use(express.json());

// 🔹 Rutes de la API
app.use("/auth", authRoutes);                  // login i register per club/entrenador
app.use("/clubes", clubsRoutes);               // gestió de clubs
app.use("/entrenadores", entrenadoresRoutes);  // gestió d'entrenadors

// 🔹 Ruta arrel per verificar que la API funciona
app.get("/", (req, res) => {
  res.send("🚀 API de ProTactics operativa!");
});

// 🔹 Arrencar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escoltant a http://localhost:${PORT}`);
});
