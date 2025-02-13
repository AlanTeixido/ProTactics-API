const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware"); // Protecció amb JWT

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir tots els posts amb el nom de l'usuari
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT posts.id, posts.titol, posts.contingut, 
                   COALESCE(posts.image_url, 'default-post.png') AS image_url, 
                   posts.creat_en, usuarios.nombre_usuario
            FROM posts
            JOIN usuarios ON posts.usuario_id = usuarios.id
            ORDER BY posts.creat_en DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "❌ Error obtenint els posts." });
    }
});

// 🔹 Obtenir un post per ID
router.get("/:id", async (req, res) => {
    const post_id = req.params.id;

    try {
        const result = await pool.query(`
            SELECT posts.id, posts.titol, posts.contingut, 
                   COALESCE(posts.image_url, 'default-post.png') AS image_url, 
                   posts.creat_en, usuarios.nombre_usuario
            FROM posts
            JOIN usuarios ON posts.usuario_id = usuarios.id
            WHERE posts.id = $1
        `, [post_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "❌ Post no trobat." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "❌ Error obtenint el post." });
    }
});

// 🔹 Crear un post (requereix autenticació)
router.post("/", authMiddleware, async (req, res) => {
    const { titol, contingut, image_url } = req.body;
    const usuario_id = req.user.id; // ID de l'usuari autenticat

    if (!titol || !contingut) {
        return res.status(400).json({ error: "❌ Tots els camps són obligatoris." });
    }

    try {
        const result = await pool.query(
            "INSERT INTO posts (usuario_id, titol, contingut, image_url, creat_en) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [usuario_id, titol, contingut, image_url || 'default-post.png']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "❌ Error creant el post." });
    }
});

// 🔹 Editar un post (només el propietari)
router.put("/:id", authMiddleware, async (req, res) => {
    const post_id = req.params.id;
    const { titol, contingut, image_url } = req.body;
    const usuario_id = req.user.id; // ID de l'usuari autenticat

    if (!titol || !contingut) {
        return res.status(400).json({ error: "❌ Tots els camps són obligatoris." });
    }

    try {
        // Verificar si el post pertany a l'usuari
        const post = await pool.query("SELECT usuario_id FROM posts WHERE id = $1", [post_id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "❌ Post no trobat." });
        }

        if (post.rows[0].usuario_id !== usuario_id) {
            return res.status(403).json({ error: "🚫 No tens permís per editar aquest post." });
        }

        const result = await pool.query(
            "UPDATE posts SET titol = $1, contingut = $2, image_url = $3, actualitzat_en = NOW() WHERE id = $4 RETURNING *",
            [titol, contingut, image_url || 'default-post.png', post_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "❌ Error editant el post." });
    }
});

// 🔹 Eliminar un post (només el propietari)
router.delete("/:id", authMiddleware, async (req, res) => {
    const post_id = req.params.id;
    const usuario_id = req.user.id; // ID de l'usuari autenticat

    try {
        // Verificar si el post pertany a l'usuari
        const post = await pool.query("SELECT usuario_id FROM posts WHERE id = $1", [post_id]);
        if (post.rows.length === 0) {
            return res.status(404).json({ error: "❌ Post no trobat." });
        }

        if (post.rows[0].usuario_id !== usuario_id) {
            return res.status(403).json({ error: "🚫 No tens permís per eliminar aquest post." });
        }

        await pool.query("DELETE FROM posts WHERE id = $1", [post_id]);

        res.json({ missatge: "✅ Post eliminat correctament!" });
    } catch (error) {
        res.status(500).json({ error: "❌ Error eliminant el post." });
    }
});

module.exports = router;
