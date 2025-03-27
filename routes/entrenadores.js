const express = require('express');
const router = express.Router();
const { registrarEntrenador } = require('../controllers/entrenadorController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta protegida per crear entrenadors
router.post('/register', authMiddleware, registrarEntrenador);

module.exports = router;
