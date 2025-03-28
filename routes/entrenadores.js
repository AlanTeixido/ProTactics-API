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
      res.status(200).json(result.rows); // Retorna todos los entrenadores
    } catch (error) {
      console.error('❌ Error obteniendo entrenadores:', error);
      res.status(500).json({ error: 'Error al obtener los entrenadores.' });
    }
});

module.exports = router;
