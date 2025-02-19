const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Guardar un entrenamiento finalizado
router.post("/", authMiddleware, async (req, res) => {
    const { entrenamiento_id, comentarios, rendimiento, calorias_quemadas, duracion_total } = req.body;
    const usuario_id = req.user.id;

    try {
        const result = await pool.query(`
            INSERT INTO historial_entrenamientos (usuario_id, entrenamiento_id, comentarios, rendimiento, calorias_quemadas, duracion_total)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [usuario_id, entrenamiento_id, comentarios, rendimiento, calorias_quemadas, duracion_total]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error guardando historial:", error);
        res.status(500).json({ error: "Error guardando historial." });
    }
});

// 🔹 Obtener historial del usuario
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(`
            SELECT * FROM historial_entrenamientos WHERE usuario_id = $1 ORDER BY fecha_finalizacion DESC`, 
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo historial:", error);
        res.status(500).json({ error: "Error obteniendo historial." });
    }
});

module.exports = router;
