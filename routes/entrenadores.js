const express = require('express');
const router = express.Router();
const {
  registrarEntrenador,
  listarEntrenadores,
  obtenerEntrenadorPorId,
  editarEntrenador,
  eliminarEntrenador,
  obtenerMiPerfilEntrenador
} = require('../controllers/entrenadorController');

const authMiddleware = require('../middleware/authMiddleware');

// ✅ Ruta específica ha d'anar abans que les rutes dinàmiques
router.get('/me', authMiddleware, obtenerMiPerfilEntrenador);

// Altres rutes protegides
router.post('/register', authMiddleware, registrarEntrenador);
router.get('/', authMiddleware, listarEntrenadores);
router.get('/:id', authMiddleware, obtenerEntrenadorPorId);
router.put('/:id', authMiddleware, editarEntrenador);
router.delete('/:id', authMiddleware, eliminarEntrenador);

module.exports = router;
