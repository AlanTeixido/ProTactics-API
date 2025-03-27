const express = require('express');
const router = express.Router();
const { registrarClub } = require('../controllers/clubController');
const db = require('../requests/db'); // Afegim la importació de db

// Ruta per registrar un club
router.post('/register', registrarClub);

// Nova ruta GET per obtenir tots els clubs
router.get('/', async (req, res) => {
  try {
    // Consulta per obtenir els clubs des de la base de dades
    const result = await db.query('SELECT * FROM clubs');
    res.status(200).json(result.rows);  // Retorna tots els clubs
  } catch (error) {
    console.error('Error al obtenir els clubs:', error);
    res.status(500).json({ error: 'Error al recuperar els clubs' });
  }
});

module.exports = router;
