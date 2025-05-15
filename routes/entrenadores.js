const express = require('express');
const router = express.Router();
const {
  registrarEntrenador,
  listarEntrenadores,
  obtenerEntrenadorPorId,
  editarEntrenador,
  eliminarEntrenador
} = require('../controllers/entrenadorController');

const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas protegidas
router.post('/register', authMiddleware, registrarEntrenador);
router.get('/', authMiddleware, listarEntrenadores);
router.get('/:id', authMiddleware, obtenerEntrenadorPorId);
router.put('/:id', authMiddleware, editarEntrenador);
router.delete('/:id', authMiddleware, eliminarEntrenador);

module.exports = router;
