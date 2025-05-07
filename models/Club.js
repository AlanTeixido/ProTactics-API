const db = require('../requests/db');
require('bcryptjs')

const crearClub = async (nombre, correo, password) => {
  const hashed = await bcrypt.hash(password, 10);
  const result = await db.query(
    'INSERT INTO clubs (nombre, correo, password) VALUES ($1, $2, $3) RETURNING *',
    [nombre, correo, hashed]
  );
  return result.rows[0];
};

const buscarPorCorreo = async (correo) => {
  const result = await db.query('SELECT * FROM clubs WHERE correo = $1', [correo]);
  return result.rows[0];
};

const buscarClubPorId = async (id) => {
  const result = await db.query('SELECT * FROM clubs WHERE club_id = $1', [id]);
  return result.rows[0];
};

const actualizarPerfilClub = async (id, { nombre, correo, ubicacion, foto_url }) => {
  await db.query(
    `UPDATE clubs
     SET nombre = $1, correo = $2, ubicacion = $3, foto_url = $4
     WHERE club_id = $5`,
    [nombre, correo, ubicacion || null, foto_url || null, id]
  );
};

const actualizarPasswordClub = async (id, actual, nueva) => {
  const club = await buscarClubPorId(id);
  if (!club) return false;

  const match = await bcrypt.compare(actual, club.password);
  if (!match) return false;

  const hashed = await bcrypt.hash(nueva, 10);
  await db.query(
    'UPDATE clubs SET password = $1 WHERE club_id = $2',
    [hashed, id]
  );
  return true;
};

module.exports = {
  crearClub,
  buscarPorCorreo,
  buscarClubPorId,
  actualizarPerfilClub,
  actualizarPasswordClub
};
