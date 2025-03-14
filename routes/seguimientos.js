const express = require("express");
const { Pool } = require("pg");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtener todos los posts con datos de usuario y su seguimiento
router.get("/posts", async (req, res) => {
    const { usuario_id } = req.query; // El usuario autenticado se pasa como query param (opcional)

    try {
        const query = `
            SELECT posts.id, posts.titol, posts.contingut, posts.image_url, posts.creat_en,
                usuarios.nombre_usuario,
                COALESCE(entrenamientos.visibilidad, 'publico') AS visibilidad,
                (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likes_count,
                (SELECT EXISTS (
                    SELECT 1 FROM likes 
                    WHERE likes.post_id = posts.id 
                    AND likes.usuario_id = $1
                )) AS liked_by_user,
                (SELECT EXISTS (
                    SELECT 1 FROM seguimientos 
                    WHERE seguimientos.seguidor_id = $1 
                    AND seguimientos.seguido_id = posts.usuario_id
                )) AS is_following
            FROM posts
            JOIN usuarios ON posts.usuario_id = usuarios.id
            LEFT JOIN entrenamientos ON posts.entrenamiento_id = entrenamientos.id
            WHERE (entrenamientos.visibilidad = 'publico' OR entrenamientos.visibilidad IS NULL)
            ORDER BY posts.creat_en DESC;
        `;
        
        const result = await pool.query(query, [usuario_id || null]);  // Si no hay usuario, no se compara con likes ni seguidores
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo los posts públicos:", error);
        res.status(500).json({ error: "❌ Error obteniendo los posts." });
    }
});

// 🔹 Obtener posts de un usuario específico
router.get("/posts/user/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT posts.*, usuarios.nombre_usuario,
                (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likes_count,
                (SELECT EXISTS (
                    SELECT 1 FROM seguimientos 
                    WHERE seguimientos.seguidor_id = $1 
                    AND seguimientos.seguido_id = posts.usuario_id
                )) AS is_following
            FROM posts 
            LEFT JOIN usuarios ON posts.usuario_id = usuarios.id 
            WHERE posts.usuario_id = $1
            ORDER BY posts.creat_en DESC;
        `;
        const result = await pool.query(query, [id]);

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
