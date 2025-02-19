const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware"); // Protecció amb JWT

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir tots els posts només de entrenaments públics
router.get("/", async (req, res) => {
    try {
        const query = `
        SELECT posts.id, posts.titol, posts.contingut, posts.image_url, posts.creat_en,
               usuarios.nombre_usuario, COALESCE(entrenamientos.visibilidad, 'publico') AS visibilidad
        FROM posts
        JOIN usuarios ON posts.usuario_id = usuarios.id
        LEFT JOIN entrenamientos ON posts.entrenamiento_id = entrenamientos.id
        WHERE (entrenamientos.visibilidad = 'publico' OR entrenamientos.visibilidad IS NULL)
        ORDER BY posts.creat_en DESC
    `;
    

        const result = await pool.query(query);
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
            SELECT posts.*, usuarios.nombre_usuario, entrenamientos.visibilidad
            FROM posts 
            INNER JOIN usuarios ON posts.usuario_id = usuarios.id 
            INNER JOIN entrenamientos ON posts.entrenamiento_id = entrenamientos.id
            WHERE posts.usuario_id = $1
            ORDER BY posts.creat_en DESC
        `;
        const result = await pool.query(query, [usuario_id]);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obtenint els posts de l'usuari:", error);
        res.status(500).json({ error: "❌ Error obtenint els posts de l'usuari." });
    }
});

// 🔹 Crear un post (requereix autenticació)
router.post("/", authMiddleware, async (req, res) => {
    const { titol, contingut, image_url, entrenamiento_id } = req.body;
    const usuario_id = req.user.id; // ID del usuario autenticado

    if (!titol || !contingut || !entrenamiento_id) {
        return res.status(400).json({ error: "❌ Tots els camps són obligatoris." });
    }

    try {
        // Verificar si el entrenamiento existe y pertenece al usuario
        const entrenamiento = await pool.query(
            "SELECT visibilidad FROM entrenamientos WHERE id = $1 AND usuario_id = $2", 
            [entrenamiento_id, usuario_id]
        );

        if (entrenamiento.rows.length === 0) {
            return res.status(404).json({ error: "❌ Entrenament no trobat o no pertany a l'usuari." });
        }

        // Insertar el post
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
