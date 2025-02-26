const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir les últimes activitats recents
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ar.descripcion, u.nombre_usuario, ar.creado_en
            FROM actividades_recientes ar
            JOIN usuarios u ON ar.usuario_id = u.id
            ORDER BY ar.creado_en DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obtenint activitats recents:", error);
        res.status(500).json({ error: "❌ Error obtenint les activitats recents." });
    }
});

module.exports = router;
