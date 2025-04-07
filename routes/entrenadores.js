const express = require('express');
const router = express.Router();
const { registrarEntrenador } = require('../controllers/entrenadorController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../requests/db'); 

// Ruta protegida para crear entrenadores
router.post('/register', authMiddleware, registrarEntrenador);

// Ruta para obtener todos los entrenadores
router.get('/', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM entrenadores');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Error obteniendo entrenadores:', error);
      res.status(500).json({ error: 'Error al obtener los entrenadores.' });
    }
});

// Ruta para obtener entrenador por ID
router.get('/:id', async (req, res) => {
    const entrenadorId = req.params.id;
    try {
      const result = await db.query('SELECT * FROM entrenadores WHERE entrenador_id = $1', [entrenadorId]);
      const entrenador = result.rows[0];

      if (!entrenador) {
        return res.status(404).json({ error: 'Entrenador no encontrado.' });
      }

      res.status(200).json(entrenador);
    } catch (error) {
      console.error('❌ Error obteniendo entrenador por ID:', error);
      res.status(500).json({ error: 'Error al obtener entrenador por ID.' });
    }
});

module.exports = router;
