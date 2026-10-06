const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateIdParam } = require('../utils/validation');
const {
  crearEquipoController,
  obtenerEquipos,
  obtenerEquiposPorEntrenador,
  editarEquipo,
  eliminarEquipo,
} = require('../controllers/equipoController');

const router = express.Router();
router.param('id', validateIdParam);
router.use(authMiddleware);

router.post(
  '/',
  requireRole('club'),
  validateBody({
    nombre: { type: 'string', required: true, max: 100 },
    categoria: { type: 'string', required: true, max: 50 },
  }),
  asyncHandler(crearEquipoController)
);
router.get('/', asyncHandler(obtenerEquipos));
router.get('/entrenador', requireRole('entrenador'), asyncHandler(obtenerEquiposPorEntrenador));
router.get('/mis-equipos', asyncHandler(obtenerEquipos));
router.put(
  '/:id',
  requireRole('club'),
  validateBody({
    nombre: { type: 'string', nullable: false, max: 100 },
    categoria: { type: 'string', nullable: false, max: 50 },
  }),
  asyncHandler(editarEquipo)
);
router.delete('/:id', requireRole('club'), asyncHandler(eliminarEquipo));

module.exports = router;
