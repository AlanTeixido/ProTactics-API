const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { csvUpload } = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateIdParam } = require('../utils/validation');
const {
  registrarJugador,
  obtenerJugadoresPorEntrenador,
  eliminarJugador,
  obtenerJugadorPorId,
  actualizarJugador,
  obtenerJugadoresPorEquipoController,
  subirJugadoresDesdeCSV,
} = require('../controllers/jugadorController');

const router = express.Router();
router.param('id', validateIdParam);
router.param('equipo_id', validateIdParam);
router.use(authMiddleware);

router.get('/equipo/:equipo_id', asyncHandler(obtenerJugadoresPorEquipoController));
router.post('/upload-csv', requireRole('entrenador'), csvUpload, asyncHandler(subirJugadoresDesdeCSV));

router.post(
  '/register',
  requireRole('entrenador'),
  validateBody({
    nombre: { type: 'string', required: true, max: 100 },
    apellido: { type: 'string', required: true, max: 100 },
    dorsal: { type: 'int', required: true, min: 0, max: 99 },
    posicion: { type: 'string', required: true, max: 50 },
    equipo_id: { type: 'id', required: true },
  }),
  asyncHandler(registrarJugador)
);
router.get('/', asyncHandler(obtenerJugadoresPorEntrenador));
router.get('/:id', asyncHandler(obtenerJugadorPorId));
router.put(
  '/:id',
  requireRole('entrenador'),
  validateBody({
    nombre: { type: 'string', nullable: false, max: 100 },
    apellido: { type: 'string', nullable: false, max: 100 },
    dorsal: { type: 'int', nullable: false, min: 0, max: 99 },
    posicion: { type: 'string', nullable: false, max: 50 },
    equipo_id: { type: 'id', nullable: false },
  }),
  asyncHandler(actualizarJugador)
);
router.delete('/:id', requireRole('entrenador'), asyncHandler(eliminarJugador));

module.exports = router;
