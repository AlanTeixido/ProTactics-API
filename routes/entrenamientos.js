const express = require('express');
const router = express.Router();
const { crearEntrenamientoController, obtenerEntrenamientos } = require('../controllers/entrenamientoController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para crear un entrenamiento
router.post('/', authMiddleware, crearEntrenamientoController);

// Ruta para obtener todos los entrenamientos de un entrenador
router.get('/', authMiddleware, obtenerEntrenamientos);

module.exports = router;
