const express = require('express');
const router = express.Router();
const {
  registrarClub,
  obtenerClubs,
  obtenerClubPorId,
  editarClub
} = require('../controllers/clubController');
const authMiddleware = require('../middleware/authMiddleware');

// Crear club (registro público)
router.post('/register', registrarClub);

// Obtener todos los clubs
router.get('/', authMiddleware, obtenerClubs);

// Obtener un club por ID
router.get('/:id', authMiddleware, obtenerClubPorId);

// Editar un club
router.put('/:id', authMiddleware, editarClub);

module.exports = router;
