const express = require('express');
const router = express.Router();
const {
  crearEquipoController,
  obtenerEquipos,
  editarEquipo,
  eliminarEquipo
} = require('../controllers/equipoController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, crearEquipoController);
router.get('/', authMiddleware, obtenerEquipos);
router.put('/:id', authMiddleware, editarEquipo);
router.delete('/:id', authMiddleware, eliminarEquipo);

module.exports = router;
