const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { authRateLimit } = require('../middleware/rateLimit');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody, validateIdParam } = require('../utils/validation');
const {
  registrarClub,
  listarClubs,
  obtenerClubPorId,
  editarPerfilClub,
  editarPasswordClub,
} = require('../controllers/clubController');

const router = express.Router();
router.param('id', validateIdParam);

// Registration (public)
router.post(
  '/register',
  authRateLimit,
  validateBody({
    nombre: { type: 'string', required: true, max: 100 },
    correo: { type: 'email', required: true },
    password: { type: 'password', required: true },
    ubicacion: { type: 'string', max: 150 },
  }),
  asyncHandler(registrarClub)
);

// Public list of clubs (only public columns)
router.get('/', asyncHandler(listarClubs));

// Club profile: the club itself or its coaches
router.get('/:id', authMiddleware, asyncHandler(obtenerClubPorId));

// Edit the club profile (owner only)
router.put(
  '/:id',
  authMiddleware,
  validateBody({
    nombre: { type: 'string', required: true, max: 100 },
    correo: { type: 'email', required: true },
    ubicacion: { type: 'string', max: 150 },
    foto_url: { type: 'url' },
  }),
  asyncHandler(editarPerfilClub)
);

// Change the club password (owner only, needs the current password)
router.put(
  '/:id/password',
  authRateLimit,
  authMiddleware,
  validateBody({
    contrasena_actual: { type: 'text', required: true, max: 1024 },
    contrasena_nova: { type: 'password', required: true },
  }),
  asyncHandler(editarPasswordClub)
);

module.exports = router;
