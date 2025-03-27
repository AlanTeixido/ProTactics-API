const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir tots els entrenadors
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.entrenador_id, e.nombre, e.correo, e.equipo, e.club_id, c.nombre AS club_nombre
            FROM entrenadores e
            JOIN clubs c ON e.club_id = c.club_id
            ORDER BY e.creado_en DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Obtenir un entrenador per ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT e.entrenador_id, e.nombre, e.correo, e.equipo, e.club_id, c.nombre AS club_nombre
            FROM entrenadores e
            JOIN clubs c ON e.club_id = c.club_id
            WHERE e.entrenador_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Entrenador no trobat." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Eliminar un entrenador
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM entrenadores WHERE entrenador_id = $1', [id]);
        res.json({ message: "✅ Entrenador eliminat correctament." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
