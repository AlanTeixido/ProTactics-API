const express = require('express');
const router = express.Router();
const {
    obtenerTodasPublicaciones,
    obtenerPublicacionPorId,
    crearNuevaPublicacion,
    subirPublicacionDesdeEntrenamiento,
    eliminarPublicacionPorId,
    likePublicacion,
    unlikePublicacion
} = require('../controllers/publicacionesController'); 

const authMiddleware = require('../middleware/authMiddleware');

router.get('/', obtenerTodasPublicaciones);
router.get('/:id', obtenerPublicacionPorId);
router.post('/', authMiddleware, crearNuevaPublicacion);
router.post('/desde-entrenamiento', authMiddleware, subirPublicacionDesdeEntrenamiento);
router.delete('/:id', authMiddleware, eliminarPublicacionPorId);
router.post('/:id/like', authMiddleware, likePublicacion);
router.delete('/:id/like', authMiddleware, unlikePublicacion);

module.exports = router;
