const express = require('express');
const router = express.Router();
const {
  registrarClub,
  obtenerClubPorId,
  editarPerfilClub,
  editarPasswordClub
} = require('../controllers/clubController');
const db = require('../requests/db');
const authMiddleware = require('../middleware/authMiddleware');

// Registro
router.post('/register', registrarClub);

// Obtener todos los clubs
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clubs');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener clubs:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener perfil de un club por ID
router.get('/:id', authMiddleware, obtenerClubPorId);

// Editar perfil
router.put('/:id', authMiddleware, editarPerfilClub);

// Editar contraseña
router.put('/:id/password', authMiddleware, editarPasswordClub);

module.exports = router;
