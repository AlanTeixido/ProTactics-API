const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateIdParam } = require('../utils/validation');
const {
  registrarEntrenador,
  listarEntrenadores,
  obtenerEntrenadorPorId,
  editarEntrenador,
  eliminarEntrenador,
  obtenerMiPerfilEntrenador,
} = require('../controllers/entrenadorController');

const router = express.Router();
router.param('id', validateIdParam);
router.use(authMiddleware);

// Specific routes go before the dynamic ones.
router.get('/me', requireRole('entrenador'), asyncHandler(obtenerMiPerfilEntrenador));

router.post(
  '/register',
  requireRole('club'),
  validateBody({
    nombre: { type: 'string', required: true, max: 100 },
    correo: { type: 'email', required: true },
    password: { type: 'password', required: true },
    equipo: { type: 'string', required: true, max: 100 },
  }),
  asyncHandler(registrarEntrenador)
);
router.get('/', requireRole('club'), asyncHandler(listarEntrenadores));

// Club: its own coaches. Coach: only their own profile.
router.get('/:id', asyncHandler(obtenerEntrenadorPorId));
router.put(
  '/:id',
  validateBody({
    nombre: { type: 'string', nullable: false, max: 100 },
    correo: { type: 'email', nullable: false },
    password: { type: 'password' },
    equipo: { type: 'string', max: 100 },
    telefono: { type: 'string', max: 30 },
    foto_url: { type: 'url' },
    notas: { type: 'text', max: 2000 },
  }),
  asyncHandler(editarEntrenador)
);
router.delete('/:id', requireRole('club'), asyncHandler(eliminarEntrenador));

module.exports = router;
