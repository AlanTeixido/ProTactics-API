const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtener entrenamientos de un usuario
router.get("/user/:id", async (req, res) => {
    const usuario_id = req.params.id;

    try {
        const query = `
            SELECT * FROM entrenamientos 
            WHERE usuario_id = $1 
            ORDER BY inicio DESC
        `;
        const result = await pool.query(query, [usuario_id]);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo entrenamientos:", error);
        res.status(500).json({ error: "❌ Error obteniendo entrenamientos." });
    }
});

// 🔹 Crear un entrenamiento (requiere autenticación)
router.post("/", authMiddleware, async (req, res) => {
    const {
        titulo, tipo_deporte, descripcion, duracion, distancia,
        desnivel_acumulado, calorias_quemadas, inicio, fin, visibilidad
    } = req.body;
    const usuario_id = req.user.id;

    if (!titulo || !tipo_deporte || !duracion || !inicio) {
        return res.status(400).json({ error: "❌ Todos los campos requeridos." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO entrenamientos 
            (usuario_id, titulo, tipo_deporte, descripcion, duracion, distancia, 
            desnivel_acumulado, calorias_quemadas, inicio, fin, visibilidad, creado_en) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`,
            [usuario_id, titulo, tipo_deporte, descripcion, duracion, distancia,
            desnivel_acumulado, calorias_quemadas, inicio, fin, visibilidad]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error creando el entrenamiento:", error);
        res.status(500).json({ error: "❌ Error creando el entrenamiento." });
    }
});

// 🔹 Eliminar un entrenamiento (solo el propietario)
router.delete("/:id", authMiddleware, async (req, res) => {
    const entrenamiento_id = req.params.id;
    const usuario_id = req.user.id;

    try {
        const entrenamiento = await pool.query(
            "SELECT usuario_id FROM entrenamientos WHERE id = $1",
            [entrenamiento_id]
        );

        if (entrenamiento.rows.length === 0) {
            return res.status(404).json({ error: "❌ Entrenamiento no encontrado." });
        }

        if (entrenamiento.rows[0].usuario_id !== usuario_id) {
            return res.status(403).json({ error: "🚫 No tienes permiso para eliminar este entrenamiento." });
        }

        await pool.query("DELETE FROM entrenamientos WHERE id = $1", [entrenamiento_id]);

        res.json({ mensaje: "✅ Entrenamiento eliminado correctamente!" });
    } catch (error) {
        console.error("❌ Error eliminando el entrenamiento:", error);
        res.status(500).json({ error: "❌ Error eliminando el entrenamiento." });
    }
});

module.exports = router;
