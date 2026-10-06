const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateIdParam } = require('../utils/validation');
const {
  crearEntrenamientoController,
  editarEntrenamientoController,
  eliminarEntrenamientoController,
  obtenerEntrenamientosController,
} = require('../controllers/entrenamientoController');

const router = express.Router();
router.param('id', validateIdParam);
router.use(authMiddleware, requireRole('entrenador'));

const camps = (titulo) => ({
  titulo,
  descripcion: { type: 'text', max: 5000 },
  categoria: { type: 'string', max: 50 },
  campo: { type: 'string', max: 100 },
  fecha_entrenamiento: { type: 'date' },
  duracion_repeticion: { type: 'interval' },
  repeticiones: { type: 'int', min: 0, max: 1000 },
  descanso: { type: 'int', min: 0, max: 1440 },
  valoracion: { type: 'int', min: 0, max: 5 },
  imagen_url: { type: 'url' },
  notas: { type: 'text', max: 5000 },
});

// Create a training session (players must belong to the coach's club)
router.post(
  '/',
  validateBody({
    ...camps({ type: 'string', required: true, max: 150 }),
    jugadores: { type: 'ids', max: 100 },
  }),
  asyncHandler(crearEntrenamientoController)
);

// Sessions of the authenticated coach
router.get('/', asyncHandler(obtenerEntrenamientosController));

// Edit / delete (own sessions only)
router.put(
  '/:id',
  validateBody(camps({ type: 'string', nullable: false, max: 150 })),
  asyncHandler(editarEntrenamientoController)
);
router.delete('/:id', asyncHandler(eliminarEntrenamientoController));

module.exports = router;
