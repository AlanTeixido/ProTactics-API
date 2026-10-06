const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateIdParam } = require('../utils/validation');
const {
  obtenerTodasPublicaciones,
  obtenerPublicacionPorId,
  crearNuevaPublicacion,
  subirPublicacionDesdeEntrenamiento,
  eliminarPublicacionPorId,
  likePublicacion,
  unlikePublicacion,
} = require('../controllers/publicacionesController');

const router = express.Router();
router.param('id', validateIdParam);

// Public feed
router.get('/', asyncHandler(obtenerTodasPublicaciones));
router.get('/:id', asyncHandler(obtenerPublicacionPorId));

router.post(
  '/',
  authMiddleware,
  validateBody({
    titulo: { type: 'string', required: true, max: 150 },
    contenido: { type: 'text', required: true, max: 10000 },
    imagen_url: { type: 'url' },
    entrenamiento_id: { type: 'id' },
  }),
  asyncHandler(crearNuevaPublicacion)
);
router.post(
  '/desde-entrenamiento',
  authMiddleware,
  validateBody({
    entrenamiento_id: { type: 'id', required: true },
    titulo: { type: 'string', required: true, max: 150 },
    contenido: { type: 'text', required: true, max: 10000 },
    imagen_url: { type: 'url' },
    categoria: { type: 'string', max: 50 },
    campo: { type: 'string', max: 100 },
    fecha_entrenamiento: { type: 'date', required: true },
    duracion_repeticion: { type: 'interval' },
    repeticiones: { type: 'int', min: 0, max: 1000 },
    total_duracion: { type: 'interval' },
    descanso: { type: 'int', min: 0, max: 1440 },
    notas_adicionales: { type: 'text', max: 5000 },
  }),
  asyncHandler(subirPublicacionDesdeEntrenamiento)
);
router.delete('/:id', authMiddleware, asyncHandler(eliminarPublicacionPorId));
router.post('/:id/like', authMiddleware, asyncHandler(likePublicacion));
router.delete('/:id/like', authMiddleware, asyncHandler(unlikePublicacion));

module.exports = router;
