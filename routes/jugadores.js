const express = require('express');
const router = express.Router();
const {
  registrarJugador,
  obtenerJugadoresPorEntrenador,
  eliminarJugador,
  obtenerJugadorPorId,
  actualizarJugador,
  obtenerJugadoresPorEquipoController
} = require('../controllers/jugadorController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authMiddleware, registrarJugador);
router.get('/', authMiddleware, obtenerJugadoresPorEntrenador);
router.get('/:id', authMiddleware, obtenerJugadorPorId);
router.put('/:id', authMiddleware, actualizarJugador);
router.delete('/:id', authMiddleware, eliminarJugador);
router.get('/equipo/:equipo_id', authMiddleware, obtenerJugadoresPorEquipoController);


module.exports = router;
