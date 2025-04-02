const express = require('express');
const router = express.Router();
const {
  crearEquipoController,
  obtenerEquipos,
  obtenerEquiposPorEntrenador,
  editarEquipo,
  eliminarEquipo
} = require('../controllers/equipoController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, crearEquipoController);
router.get('/', authMiddleware, obtenerEquipos);
router.get('/entrenador', authMiddleware, obtenerEquiposPorEntrenador);
router.put('/:id', authMiddleware, editarEquipo);
router.delete('/:id', authMiddleware, eliminarEquipo);

module.exports = router;
