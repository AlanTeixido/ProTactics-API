const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  crearEntrenamientoController,
  listarEntrenamientos,
  obtenerEntrenamiento,
  actualizarEntrenamientoController,
  eliminarEntrenamientoController
} = require('../controllers/entrenamientoController');

router.post('/', auth, crearEntrenamientoController);
router.get('/', auth, listarEntrenamientos);
router.get('/:id', auth, obtenerEntrenamiento);
router.put('/:id', auth, actualizarEntrenamientoController);
router.delete('/:id', auth, eliminarEntrenamientoController);

module.exports = router;
