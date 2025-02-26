const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir estadístiques de l'usuari loguejat
router.get("/", authMiddleware, async (req, res) => {
    const usuario_id = req.user.id;

    try {
        const result = await pool.query(`
            SELECT COUNT(*) AS total_trainings,
                   COALESCE(SUM(duracion), '0:00:00') AS total_time,
                   COALESCE(SUM(calorias_quemadas), 0) AS total_calories,
                   COALESCE(AVG(frecuencia_cardiaca_media), 0) AS avg_heart_rate
            FROM progreso_entrenamientos
            WHERE usuario_id = $1
        `, [usuario_id]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error obtenint estadístiques:", error);
        res.status(500).json({ error: "❌ Error obtenint les estadístiques." });
    }
});

module.exports = router;
