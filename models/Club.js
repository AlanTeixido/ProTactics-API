const db = require('../config/db');

// Profile visible to the club itself and to its coaches (never the password hash).
const PROFILE_COLUMNS = 'club_id, nombre, correo, ubicacion, foto_url, creado_en';
// Public listing: no emails.
const PUBLIC_COLUMNS = 'club_id, nombre, ubicacion, foto_url';

const crearClub = async ({ nombre, correo, passwordHash, ubicacion }) => {
  const result = await db.query(
    `INSERT INTO clubs (nombre, correo, password, ubicacion)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PROFILE_COLUMNS}`,
    [nombre, correo, passwordHash, ubicacion || null]
  );
  return result.rows[0];
};

const listarClubs = async () => {
  const result = await db.query(`SELECT ${PUBLIC_COLUMNS} FROM clubs ORDER BY nombre`);
  return result.rows;
};

const buscarClubPorId = async (id) => {
  const result = await db.query(`SELECT ${PROFILE_COLUMNS} FROM clubs WHERE club_id = $1`, [id]);
  return result.rows[0];
};

// Includes the password hash: for authentication only, never for responses.
const buscarCredencialesPorCorreo = async (correo) => {
  const result = await db.query(
    'SELECT club_id, nombre, correo, password FROM clubs WHERE LOWER(correo) = LOWER($1)',
    [correo]
  );
  return result.rows[0];
};

const obtenerPasswordHash = async (id) => {
  const result = await db.query('SELECT password FROM clubs WHERE club_id = $1', [id]);
  return result.rows[0]?.password;
};

const actualizarPerfilClub = async (id, { nombre, correo, ubicacion, foto_url }) => {
  const result = await db.query(
    `UPDATE clubs
     SET nombre = $1, correo = $2, ubicacion = $3, foto_url = $4
     WHERE club_id = $5`,
    [nombre, correo, ubicacion || null, foto_url || null, id]
  );
  return result.rowCount;
};

const actualizarPasswordClub = async (id, passwordHash) => {
  await db.query('UPDATE clubs SET password = $1 WHERE club_id = $2', [passwordHash, id]);
};

module.exports = {
  crearClub,
  listarClubs,
  buscarClubPorId,
  buscarCredencialesPorCorreo,
  obtenerPasswordHash,
  actualizarPerfilClub,
  actualizarPasswordClub,
};
