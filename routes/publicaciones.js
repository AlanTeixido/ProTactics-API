const express = require('express');
const router = express.Router();
const { obtenerTodasPublicaciones, crearNuevaPublicacion, eliminarPublicacionPorId, likePublicacion, unlikePublicacion } = require('../controllers/publicaciones');
const authMiddleware = require('../middlewares/auth');

router.get('/', obtenerTodasPublicaciones);
router.post('/', authMiddleware, crearNuevaPublicacion);
router.delete('/:id', authMiddleware, eliminarPublicacionPorId);
router.post('/:id/like', authMiddleware, likePublicacion);
router.delete('/:id/like', authMiddleware, unlikePublicacion);

module.exports = router;