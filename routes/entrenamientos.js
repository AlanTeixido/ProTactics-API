const express = require('express');
const router = express.Router();

const {
  crearEntrenamientoController,
  editarEntrenamientoController,
  eliminarEntrenamientoController,
  obtenerEntrenamientosController
} = require('../controllers/entrenamientoController');
const authMiddleware = require('../middleware/authMiddleware');

// Crear entrenamiento
router.post('/', authMiddleware, crearEntrenamientoController);

// Obtener todos los entrenamientos de un entrenador
router.get('/', authMiddleware, obtenerEntrenamientosController);

// Editar entrenamiento
router.put('/:id', authMiddleware, editarEntrenamientoController);

// Eliminar entrenamiento
router.delete('/:id', authMiddleware, eliminarEntrenamientoController);

module.exports = router;
