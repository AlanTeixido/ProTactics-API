const express = require("express");
const { Pool } = require("pg");
const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtener todos los posts con datos de usuario
router.get("/posts", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.titol, p.contingut, p.image_url, p.creat_en, 
                   p.likes_count, p.liked_by_user, 
                   u.id AS usuario_id, u.nombre_usuario 
            FROM posts p
            JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.creat_en DESC;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo los posts:", error.message);
        res.status(500).json({ error: "❌ Error obteniendo los posts." });
    }
});

// 🔹 Obtener posts de un usuario específico
router.get("/posts/user/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT p.id, p.titol, p.contingut, p.image_url, p.creat_en, 
                   p.likes_count, p.liked_by_user, 
                   u.id AS usuario_id, u.nombre_usuario 
            FROM posts p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.usuario_id = $1
            ORDER BY p.creat_en DESC;
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo los posts de usuario:", error.message);
        res.status(500).json({ error: "❌ Error obteniendo los posts del usuario." });
    }
});

// 🔹 Seguir a un usuario
router.post("/:id/seguir", async (req, res) => {
    const { id } = req.params;
    const { seguidor_id } = req.body;

    if (!seguidor_id) {
        return res.status(400).json({ error: "❌ El ID del seguidor es requerido." });
    }

    try {
        await pool.query(`
            INSERT INTO seguimientos (seguidor_id, seguido_id) 
            VALUES ($1, $2) 
            ON CONFLICT (seguidor_id, seguido_id) DO NOTHING;
        `, [seguidor_id, id]);

        res.json({ message: "✅ Usuario seguido correctamente." });
    } catch (error) {
        console.error("❌ Error al seguir al usuario:", error.message);
        res.status(500).json({ error: "❌ Error al seguir al usuario." });
    }
});

// 🔹 Dejar de seguir a un usuario
router.delete("/:id/dejar-seguir", async (req, res) => {
    const { id } = req.params;
    const { seguidor_id } = req.body;

    if (!seguidor_id) {
        return res.status(400).json({ error: "❌ El ID del seguidor es requerido." });
    }

    try {
        await pool.query(`
            DELETE FROM seguimientos WHERE seguidor_id = $1 AND seguido_id = $2;
        `, [seguidor_id, id]);

        res.json({ message: "✅ Has dejado de seguir al usuario." });
    } catch (error) {
        console.error("❌ Error al dejar de seguir al usuario:", error.message);
        res.status(500).json({ error: "❌ Error al dejar de seguir al usuario." });
    }
});

// 🔹 Obtener la lista de usuarios seguidos por un usuario
router.get("/:id/seguidos", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT u.id, u.nombre_usuario 
            FROM usuarios u 
            JOIN seguimientos s ON u.id = s.seguido_id 
            WHERE s.seguidor_id = $1;
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo los usuarios seguidos:", error.message);
        res.status(500).json({ error: "❌ Error obteniendo los usuarios seguidos." });
    }
});

// 🔹 Obtener la lista de seguidores de un usuario
router.get("/:id/seguidores", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT u.id, u.nombre_usuario 
            FROM usuarios u 
            JOIN seguimientos s ON u.id = s.seguidor_id 
            WHERE s.seguido_id = $1;
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo los seguidores:", error.message);
        res.status(500).json({ error: "❌ Error obteniendo los seguidores." });
    }
});

module.exports = router;
