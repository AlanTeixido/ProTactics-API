const express = require('express');
const router = express.Router();
const {
  crearEquipoController,
  obtenerEquipos,
  obtenerEquiposPorEntrenador,
  editarEquipo,
  eliminarEquipo
} = require('../controllers/equipoController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, crearEquipoController);
router.get('/', authMiddleware, obtenerEquipos);
router.get('/entrenador', authMiddleware, obtenerEquiposPorEntrenador);
router.put('/:id', authMiddleware, editarEquipo);
router.delete('/:id', authMiddleware, eliminarEquipo);

router.get('/mis-equipos', authMiddleware, (req, res) => {
  const { tipo } = req.user;
  if (tipo === 'club') return obtenerEquipos(req, res);
  if (tipo === 'entrenador') return obtenerEquiposPorEntrenador(req, res);
  return res.status(403).json({ error: 'Tipus d\'usuari no suportat.' });
});


module.exports = router;
