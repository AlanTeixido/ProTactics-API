const jwt = require('jsonwebtoken');
const db = require('../requests/db'); // 👈 Assegura't que aquest camí és correcte

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Falta el token' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionat' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id, tipo, correo } = decoded;
    const userData = { id, tipo, correo };

    // 🔎 Si és entrenador, busquem el seu club_id
    if (tipo === 'entrenador') {
      const result = await db.query(
        'SELECT club_id FROM entrenadores WHERE entrenador_id = $1',
        [id]
      );

      if (result.rows.length > 0) {
        userData.club_id = result.rows[0].club_id;
      }
    }

    req.user = userData;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invàlid o caducat' });
  }
};
