// routes/usuarios.js
const express = require('express');
const router = express.Router();
const { getResumen } = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta per obtenir el perfil/resumen d’un usuari
router.get('/:id/resumen', authMiddleware, getResumen);

module.exports = router;
