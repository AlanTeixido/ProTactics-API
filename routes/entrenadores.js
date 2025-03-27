const express = require('express');
const router = express.Router();
const { registrarEntrenador } = require('../controllers/entrenadorController');

router.post('/register', registrarEntrenador);

module.exports = router;
