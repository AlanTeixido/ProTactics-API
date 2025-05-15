const express = require('express');
const router = express.Router();
const {
  registrarEntrenador,
  listarEntrenadores,
  eliminarEntrenador,
  editarEntrenador,
  obtenerEntrenadorPorId
} = require('../controllers/entrenadorController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas protegidas por token (club autenticado)
router.post('/register', authMiddleware, registrarEntrenador);
router.get('/', authMiddleware, listarEntrenadores);
router.delete('/:id', authMiddleware, eliminarEntrenador);
router.put('/:id', authMiddleware, editarEntrenador);
router.get('/:id', authMiddleware, obtenerEntrenadorPorId);
module.exports = router;
