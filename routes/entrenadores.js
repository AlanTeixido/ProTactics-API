const express = require('express');
const router = express.Router();
const { registrarEntrenador } = require('../controllers/entrenadorController');
const bcrypt = require('bcryptjs'); 
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../requests/db'); 

// Crear entrenador (protegido, usa club_id desde token)
router.post('/register', authMiddleware, registrarEntrenador);

// ✅ Obtener entrenadores solo del club autenticado
router.get('/', authMiddleware, async (req, res) => {
  const club_id = req.user.id;

  // (opcional) validación de rol
  if (req.user.tipo !== 'club') {
    return res.status(403).json({ error: 'Accés restringit només a clubs.' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM entrenadores WHERE club_id = $1',
      [club_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error obtenint entrenadors:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

// Obtener entrenador por ID (público o privado, según prefieras)
router.get('/:id', async (req, res) => {
  const entrenadorId = req.params.id;
  try {
    const result = await db.query('SELECT * FROM entrenadores WHERE entrenador_id = $1', [entrenadorId]);
    const entrenador = result.rows[0];

    if (!entrenador) {
      return res.status(404).json({ error: 'Entrenador no trobat.' });
    }

    res.status(200).json(entrenador);
  } catch (error) {
    console.error('❌ Error obtenint entrenador per ID:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

// Editar entrenador (protegido)
router.put('/:id', authMiddleware, async (req, res) => {
  const { nombre, correo, password, foto_url, telefono, notas } = req.body;
  const entrenadorId = req.params.id;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    await db.query(
      `UPDATE entrenadores 
       SET nombre = $1, correo = $2, password = COALESCE($3, password), 
           foto_url = $4, telefono = $5, notas = $6 
       WHERE entrenador_id = $7`,
      [nombre, correo, hashedPassword, foto_url || null, telefono || null, notas || null, entrenadorId]
    );

    res.status(200).json({ message: 'Entrenador actualitzat correctament.' });
  } catch (error) {
    console.error('Error actualitzant entrenador:', error);
    res.status(500).json({ error: 'Error del servidor.', details: error.message });
  }
});

module.exports = router;
