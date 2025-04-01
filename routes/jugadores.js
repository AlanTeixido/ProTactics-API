const express = require('express');
const router = express.Router();
const {
  registrarJugador,
  obtenerJugadoresPorEntrenador
} = require('../controllers/jugadorController');
const authMiddleware = require('../middleware/authMiddleware');

// Crear jugador
router.post('/register', authMiddleware, registrarJugador);

// Obtenir jugadors
router.get('/', authMiddleware, obtenerJugadoresPorEntrenador);

module.exports = router;
