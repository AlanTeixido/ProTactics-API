const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir estadístiques de l'usuari autenticat
router.get("/", authMiddleware, async (req, res) => {
  try {
    // 🛠️ Comprovació extra: req.user ha de tenir un ID
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Accés denegat. Usuari no autenticat." });
    }

    const usuario_id = req.user.id;

    // 🔹 Executar la consulta SQL per obtenir estadístiques
    const result = await pool.query(
      `SELECT 
        COUNT(*)::INTEGER AS total_trainings, 
        COALESCE(SUM(EXTRACT(EPOCH FROM duracion))::INTEGER, 0) AS total_seconds, 
        COALESCE(SUM(calorias_quemadas), 0) AS total_calories, 
        COALESCE(AVG(frecuencia_cardiaca_media), 0)::INTEGER AS avg_heart_rate
      FROM progreso_entrenamientos
      WHERE usuario_id = $1`, 
      [usuario_id]
    );

    // 🔹 Convertim els segons totals en format hores:minuts
    const totalSeconds = result.rows[0].total_seconds;
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalTimeFormatted = `${totalHours}h ${totalMinutes}m`;

    // 🔹 Retornem les dades en format JSON
    res.json({
      total_trainings: result.rows[0].total_trainings,
      total_time: totalTimeFormatted,
      total_calories: result.rows[0].total_calories,
      avg_heart_rate: result.rows[0].avg_heart_rate
    });

  } catch (error) {
    console.error("❌ Error obtenint estadístiques:", error);
    res.status(500).json({ error: "❌ Error obtenint les estadístiques." });
  }
});

module.exports = router;
