const express = require('express');
const router = express.Router();
const { registrarEntrenador } = require('../controllers/entrenadorController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../requests/db');  // Afegir la importació de db

// Ruta protegida per crear entrenadors
router.post('/register', authMiddleware, registrarEntrenador);

// Ruta per obtenir tots els entrenadors
router.get('/', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM entrenadores');
      res.status(200).json(result.rows); // Retorna tots els entrenadors
    } catch (error) {
      console.error('❌ Error obtenint entrenadors:', error);
      res.status(500).json({ error: 'Error al obtenir els entrenadors.' });
    }
});

module.exports = router;
