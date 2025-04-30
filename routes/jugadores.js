const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // carpeta temporal para subir archivos

const {
  registrarJugador,
  obtenerJugadoresPorEntrenador,
  eliminarJugador,
  obtenerJugadorPorId,
  actualizarJugador,
  obtenerJugadoresPorEquipoController,
  subirJugadoresDesdeCSV
} = require('../controllers/jugadorController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authMiddleware, registrarJugador);
router.get('/', authMiddleware, obtenerJugadoresPorEntrenador);
router.get('/:id', authMiddleware, obtenerJugadorPorId);
router.put('/:id', authMiddleware, actualizarJugador);
router.delete('/:id', authMiddleware, eliminarJugador);
router.get('/equipo/:equipo_id', authMiddleware, obtenerJugadoresPorEquipoController);

// 🚨 NUEVA RUTA PARA SUBIR CSV
router.post('/upload-csv', authMiddleware, upload.single('csv'), subirJugadoresDesdeCSV);

module.exports = router;
