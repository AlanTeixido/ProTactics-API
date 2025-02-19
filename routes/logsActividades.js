const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Registrar una acción en los logs
router.post("/", authMiddleware, async (req, res) => {
    const { descripcion } = req.body;
    const usuario_id = req.user.id;

    try {
        await pool.query(`INSERT INTO logs_actividades (usuario_id, descripcion) VALUES ($1, $2)`, 
            [usuario_id, descripcion]
        );
        res.json({ message: "✅ Log registrado correctamente." });
    } catch (error) {
        console.error("❌ Error registrando log:", error);
        res.status(500).json({ error: "Error registrando log." });
    }
});

// 🔹 Obtener logs del usuario
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(`
            SELECT * FROM logs_actividades WHERE usuario_id = $1 ORDER BY fecha DESC`, 
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo logs:", error);
        res.status(500).json({ error: "Error obteniendo logs." });
    }
});

module.exports = router;
