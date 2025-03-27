const db = require('../requests/db');

const crearClub = async (nombre, correo, password) => {
  const result = await db.query(
    'INSERT INTO clubs (nombre, correo, password) VALUES ($1, $2, $3) RETURNING *',
    [nombre, correo, password]
  );
  return result.rows[0];
};

const buscarPorCorreo = async (correo) => {
  const result = await db.query(
    'SELECT * FROM clubs WHERE correo = $1',
    [correo]
  );
  return result.rows[0];
};

module.exports = {
  crearClub,
  buscarPorCorreo
};
