const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { jwtSecret } = require('../config/env');

const ROLES = ['club', 'entrenador'];

// Verifies the bearer token and sets req.user = { id, tipo, correo[, club_id] }.
// The account must still exist; for coaches the current club_id is loaded from the DB.
module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Falta el token' });
  }

  const [scheme, token] = header.split(' ');
  if (!/^Bearer$/i.test(scheme || '') || !token) {
    return res.status(401).json({ error: 'Token no proporcionat' });
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
  } catch (err) {
    return res.status(401).json({ error: 'Token invàlid o caducat' });
  }

  const { id, tipo, correo } = payload;
  if (!Number.isInteger(id) || !ROLES.includes(tipo)) {
    return res.status(401).json({ error: 'Token invàlid o caducat' });
  }

  try {
    const user = { id, tipo, correo };
    if (tipo === 'entrenador') {
      const { rows } = await db.query('SELECT club_id FROM entrenadores WHERE entrenador_id = $1', [id]);
      if (rows.length === 0) return res.status(401).json({ error: 'Usuari no trobat' });
      user.club_id = rows[0].club_id;
    } else {
      const { rows } = await db.query('SELECT 1 FROM clubs WHERE club_id = $1', [id]);
      if (rows.length === 0) return res.status(401).json({ error: 'Usuari no trobat' });
    }
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};
