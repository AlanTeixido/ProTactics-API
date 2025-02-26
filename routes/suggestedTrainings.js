const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir entrenaments suggerits (aleatoris)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, titulo, tipo_deporte, descripcion
            FROM entrenamientos
            WHERE visibilidad = 'publico'
            ORDER BY RANDOM()
            LIMIT 5
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obtenint entrenaments suggerits:", error);
        res.status(500).json({ error: "❌ Error obtenint entrenaments suggerits." });
    }
});

module.exports = router;
