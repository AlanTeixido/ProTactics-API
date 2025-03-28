// routes/jugadores.js
const express = require('express');
const router = express.Router();
const { registrarJugador } = require('../controllers/jugadorController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta protegida para crear jugadores
router.post('/register', authMiddleware, registrarJugador);

module.exports = router;
