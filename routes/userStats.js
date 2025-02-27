const express = require("express");
const { Pool } = require("pg");

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🔹 Endpoint públic per obtenir estadístiques generals
router.get("/public", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*)::INTEGER AS total_trainings,
        COALESCE(SUM(EXTRACT(EPOCH FROM duracion_total))::INTEGER, 0) AS total_seconds,
        COALESCE(SUM(calorias_quemadas), 0) AS total_calories,
        COALESCE(AVG(rendimiento), 0)::INTEGER AS avg_performance
      FROM historial_entrenamientos;`
    );

    // 🔹 Convertir segons a hores i minuts
    const totalSeconds = result.rows[0].total_seconds || 0;
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalTimeFormatted = `${totalHours}h ${totalMinutes}m`;

    // 🔹 Resposta JSON corregida
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

// Endpoint per obtenir l'objectiu mensual
router.get('/user_stats/monthly_goal', async (req, res) => {
  const usuario_id = req.user.id;

  try {
    // Sumar les distàncies de running i ciclisme per l'usuari durant el mes actual
    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(distancia), 0) AS completed
       FROM entrenamientos
       WHERE usuario_id = $1 AND created_en >= $2 AND tipo_deporte IN ('running', 'ciclismo')`,
      [usuario_id, moment().startOf('month').toDate()] // Filtra des de l'inici del mes
    );

    const completed = result.rows[0].completed || 0;
    const goal = 120; // Objectiu mensual, per exemple 120 km

    res.json({ completed, goal });
  } catch (error) {
    console.error('Error obtenint el progrés mensual:', error);
    res.status(500).send('Error en el servidor');
  }
});




module.exports = router;
