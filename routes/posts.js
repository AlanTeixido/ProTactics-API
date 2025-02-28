const express = require("express");
const { Pool } = require("pg");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir tots els posts només de entrenaments públics
router.get("/", async (req, res) => {
    const { usuario_id } = req.query; // L'usuari autenticat es passa com query param (opcional)

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
                )) AS liked_by_user
            FROM posts
            JOIN usuarios ON posts.usuario_id = usuarios.id
            LEFT JOIN entrenamientos ON posts.entrenamiento_id = entrenamientos.id
            WHERE (entrenamientos.visibilidad = 'publico' OR entrenamientos.visibilidad IS NULL)
            ORDER BY posts.creat_en DESC
        `;

        const result = await pool.query(query, [usuario_id || null]);  // Si no hi ha usuari, no es compara amb likes
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obtenint els posts públics:", error);
        res.status(500).json({ error: "❌ Error obtenint els posts." });
    }
});

// 🔹 Obtenir tots els posts d'un usuari (tant privats com públics)
router.get("/user/:id", async (req, res) => {
    const usuario_id = req.params.id;

    try {
        const query = `
            SELECT posts.*, usuarios.nombre_usuario,
                (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likes_count
            FROM posts 
            LEFT JOIN usuarios ON posts.usuario_id = usuarios.id 
            WHERE posts.usuario_id = $1
            ORDER BY posts.creat_en DESC
        `;
        const result = await pool.query(query, [usuario_id]);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo los posts del usuario:", error);
        res.status(500).json({ error: "❌ Error obteniendo los posts del usuario." });
    }
});

// 🔹 Crear un post
router.post("/", async (req, res) => {
    const { usuario_id, titol, contingut, image_url, entrenamiento_id } = req.body;

    if (!usuario_id || !titol || !contingut || !entrenamiento_id) {
        return res.status(400).json({ error: "❌ Tots els camps són obligatoris." });
    }

    try {
        const entrenamiento = await pool.query(
            "SELECT visibilidad FROM entrenamientos WHERE id = $1 AND usuario_id = $2", 
            [entrenamiento_id, usuario_id]
        );

        if (entrenamiento.rows.length === 0) {
            return res.status(404).json({ error: "❌ Entrenament no trobat o no pertany a l'usuari." });
        }

        const result = await pool.query(
            "INSERT INTO posts (usuario_id, titol, contingut, image_url, entrenamiento_id, creat_en) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
            [usuario_id, titol, contingut, image_url || 'default-post.png', entrenamiento_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error creant el post:", error);
        res.status(500).json({ error: "❌ Error creant el post." });
    }
});

// 🔹 Eliminar un post (verifica amb el usuario_id)
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;

    try {
        const post = await pool.query("SELECT usuario_id FROM posts WHERE id = $1", [id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "❌ Post no trobat." });
        }

        if (post.rows[0].usuario_id !== parseInt(usuario_id)) {
            return res.status(403).json({ error: "🚫 No tens permís per eliminar aquest post." });
        }

        await pool.query("DELETE FROM posts WHERE id = $1", [id]);

        res.json({ missatge: "✅ Post eliminat correctament!" });
    } catch (error) {
        res.status(500).json({ error: "❌ Error eliminant el post." });
    }
});

// 🔹 Donar Like
router.post('/:postId/like', async (req, res) => {
    const { postId } = req.params;
    const { usuario_id } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ error: "❌ Falten dades de l'usuari." });
    }

    try {
        await pool.query(
            'INSERT INTO likes (usuario_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [usuario_id, postId]
        );
        res.json({ message: '✅ Like registrat correctament!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Treure Like
router.delete('/:postId/like', async (req, res) => {
    const { postId } = req.params;
    const { usuario_id } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ error: "❌ Falten dades de l'usuari." });
    }

    try {
        await pool.query(
            'DELETE FROM likes WHERE usuario_id = $1 AND post_id = $2',
            [usuario_id, postId]
        );
        res.json({ message: '✅ Like eliminat correctament!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
