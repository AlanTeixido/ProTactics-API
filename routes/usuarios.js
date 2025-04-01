const express = require('express');
const router = express.Router();
const { obtenerResumenUsuario } = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta per obtenir el perfil/resumen d’un usuari
router.get('/:id/resumen', authMiddleware, obtenerResumenUsuario);

module.exports = router;
