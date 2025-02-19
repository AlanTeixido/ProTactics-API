const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Agregar progreso de entrenamiento
router.post("/", authMiddleware, async (req, res) => {
    const { entrenamiento_id, distancia, tiempo, calorias, frecuencia_cardiaca } = req.body;
    const usuario_id = req.user.id;

    try {
        const result = await pool.query(`
            INSERT INTO progreso_entrenamientos (usuario_id, entrenamiento_id, distancia, tiempo, calorias, frecuencia_cardiaca)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [usuario_id, entrenamiento_id, distancia, tiempo, calorias, frecuencia_cardiaca]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error registrando progreso:", error);
        res.status(500).json({ error: "Error registrando progreso." });
    }
});

// 🔹 Obtener progreso de un usuario
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(`
            SELECT * FROM progreso_entrenamientos WHERE usuario_id = $1 ORDER BY fecha DESC`, 
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo progresos:", error);
        res.status(500).json({ error: "Error obteniendo progresos." });
    }
});

module.exports = router;
