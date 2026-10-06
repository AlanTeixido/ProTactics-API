const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../utils/asyncHandler');
const { validateBody } = require('../utils/validation');
const { registrarClub, registrarEntrenador, login } = require('../controllers/authController');

const router = express.Router();

// Club sign-up (public)
router.post(
  '/register/club',
  validateBody({
    nombre: { type: 'string', required: true, max: 100 },
    correo: { type: 'email', required: true },
    password: { type: 'password', required: true },
    ubicacion: { type: 'string', max: 150 },
  }),
  asyncHandler(registrarClub)
);

// Coach sign-up: only an authenticated club can create coaches, always in its own club.
router.post(
  '/register/entrenador',
  authMiddleware,
  requireRole('club'),
  validateBody({
    nombre: { type: 'string', required: true, max: 100 },
    correo: { type: 'email', required: true },
    password: { type: 'password', required: true },
    equipo: { type: 'string', max: 100 },
  }),
  asyncHandler(registrarEntrenador)
);

// Unified login (club or coach)
router.post(
  '/login',
  validateBody({
    correo: { type: 'string', required: true, max: 254 },
    password: { type: 'text', required: true, max: 1024 },
  }),
  asyncHandler(login)
);

module.exports = router;
