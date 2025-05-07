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

const obtenerTodosLosClubs = async () => {
  const result = await db.query('SELECT * FROM clubs ORDER BY creado_en DESC');
  return result.rows;
};

const obtenerClubPorIdDB = async (id) => {
  const result = await db.query('SELECT * FROM clubs WHERE club_id = $1', [id]);
  return result.rows[0];
};

const actualizarClub = async (id, nombre, correo, ubicacion) => {
  await db.query(
    'UPDATE clubs SET nombre = $1, correo = $2, ubicacion = $3 WHERE club_id = $4',
    [nombre, correo, ubicacion, id]
  );
};

module.exports = {
  crearClub,
  buscarPorCorreo,
  obtenerTodosLosClubs,
  obtenerClubPorIdDB,
  actualizarClub
};
