const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ✅ Seguir a un usuario
router.post('/:id/seguir', async (req, res) => {
    const { id } = req.params; // ID del usuario a seguir
    const { seguidor_id } = req.body; // ID del usuario que sigue

    try {
        await pool.query(
            `INSERT INTO seguimientos (seguidor_id, seguido_id) 
             VALUES ($1, $2) 
             ON CONFLICT (seguidor_id, seguido_id) DO NOTHING;`,
            [seguidor_id, id]
        );
        res.json({ message: "Usuario seguido correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Dejar de seguir a un usuario
router.delete('/:id/dejar-seguir', async (req, res) => {
    const { id } = req.params; // ID del usuario a dejar de seguir
    const { seguidor_id } = req.body; // ID del usuario que deja de seguir

    try {
        await pool.query(
            `DELETE FROM seguimientos WHERE seguidor_id = $1 AND seguido_id = $2;`,
            [seguidor_id, id]
        );
        res.json({ message: "Has dejado de seguir al usuario." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Obtener la lista de usuarios que sigue un usuario
router.get('/:id/seguidos', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT u.id, u.nombre_usuario 
             FROM usuarios u 
             JOIN seguimientos s ON u.id = s.seguido_id 
             WHERE s.seguidor_id = $1;`,
            [id]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Obtener la lista de seguidores de un usuario
router.get('/:id/seguidores', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT u.id, u.nombre_usuario 
             FROM usuarios u 
             JOIN seguimientos s ON u.id = s.seguidor_id 
             WHERE s.seguido_id = $1;`,
            [id]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
