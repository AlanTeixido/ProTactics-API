const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  crearEntrenamientoController,
  listarEntrenamientos,
  obtenerEntrenamiento,
  actualizarEntrenamientoController,
  eliminarEntrenamientoController
} = require('../controllers/entrenamientoController');

router.post('/', authMiddleware, crearEntrenamientoController);
router.get('/', authMiddleware, listarEntrenamientos);
router.get('/:id', authMiddleware, obtenerEntrenamiento);
router.put('/:id', authMiddleware, actualizarEntrenamientoController);
router.delete('/:id', authMiddleware, eliminarEntrenamientoController);

module.exports = router;
