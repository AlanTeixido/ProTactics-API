const express = require('express');
const router = express.Router();

const {
  crearEntrenamientoController,
} = require('../controllers/entrenamientoController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', authMiddleware, crearEntrenamientoController);


module.exports = router;
