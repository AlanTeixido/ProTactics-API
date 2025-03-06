const express = require("express");
const { Pool } = require("pg");
const moment = require("moment");

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔹 Estadístiques generals públiques (temps total formatat correctament)
router.get("/public", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::INTEGER AS total_trainings,
        COALESCE(SUM(EXTRACT(EPOCH FROM duracion_total))::INTEGER, 0) AS total_seconds,
        COALESCE(SUM(calorias_quemadas), 0) AS total_calories,
        COALESCE(AVG(rendimiento), 0)::INTEGER AS avg_performance
      FROM historial_entrenamientos;
    `);

    const totalSeconds = result.rows[0].total_seconds || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const totalTimeFormatted = `${hours}h ${minutes}m`;

    res.json({
      total_trainings: result.rows[0].total_trainings,
      total_time: totalTimeFormatted,
      total_calories: result.rows[0].total_calories,
      avg_performance: result.rows[0].avg_performance
    });

  } catch (error) {
    console.error("❌ Error obtenint estadístiques públiques:", error);
    res.status(500).json({ error: "❌ Error obtenint les estadístiques públiques." });
  }
});

// 🔹 Progrés objectiu mensual
router.get('/monthly_goal', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(distancia), 0) AS completed
      FROM entrenamientos
      WHERE creado_en >= $1
        AND tipo_deporte IN ('running', 'ciclismo');
    `, [moment().startOf('month').toDate()]);

    const completed = result.rows[0].completed || 0;
    const goal = 120;  // Exemple: objectiu mensual de 120 km

    res.json({ completed, goal });
  } catch (error) {
    console.error('❌ Error obtenint el progrés mensual:', error);
    res.status(500).send('❌ Error en el servidor');
  }
});

module.exports = router;
