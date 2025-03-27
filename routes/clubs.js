const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir tots els clubs
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT club_id, nombre, correo, ubicacion, creado_en
            FROM clubs
            ORDER BY creado_en DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Obtenir un club per ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT club_id, nombre, correo, ubicacion, creado_en
            FROM clubs
            WHERE club_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Club no trobat." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Eliminar un club
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM clubs WHERE club_id = $1', [id]);
        res.json({ message: "✅ Club eliminat correctament." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
