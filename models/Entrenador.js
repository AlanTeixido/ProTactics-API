const db = require('../config/db');
const { buildSetClause } = require('../utils/sql');

// Never includes the password hash.
const PROFILE_COLUMNS = 'entrenador_id, nombre, correo, equipo, telefono, foto_url, notas, club_id, creado_en';
const EDITABLE_COLUMNS = ['nombre', 'correo', 'password', 'equipo', 'telefono', 'foto_url', 'notas'];

// Create a coach that belongs to a club.
const crearEntrenador = async ({ nombre, correo, passwordHash, equipo, club_id }) => {
  const result = await db.query(
    `INSERT INTO entrenadores (nombre, correo, password, equipo, club_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING entrenador_id, nombre, correo, equipo, club_id`,
    [nombre, correo, passwordHash, equipo || null, club_id]
  );
  return result.rows[0];
};

// Includes the password hash: for authentication only, never for responses.
const buscarCredencialesPorCorreo = async (correo) => {
  const result = await db.query(
    `SELECT entrenador_id, nombre, correo, password, club_id
     FROM entrenadores WHERE LOWER(correo) = LOWER($1)`,
    [correo]
  );
  return result.rows[0];
};

const buscarEntrenadorPorId = async (id) => {
  const result = await db.query(`SELECT ${PROFILE_COLUMNS} FROM entrenadores WHERE entrenador_id = $1`, [id]);
  return result.rows[0];
};

const obtenerEntrenadoresDelClub = async (club_id) => {
  const result = await db.query(
    `SELECT ${PROFILE_COLUMNS} FROM entrenadores WHERE club_id = $1 ORDER BY creado_en DESC`,
    [club_id]
  );
  return result.rows;
};

const eliminarEntrenadorPorId = async (entrenador_id, club_id) => {
  const result = await db.query('DELETE FROM entrenadores WHERE entrenador_id = $1 AND club_id = $2', [
    entrenador_id,
    club_id,
  ]);
  return result.rowCount;
};

// Partial update: only whitelisted columns present in `campos` are written.
const actualizarEntrenador = async (entrenador_id, campos) => {
  const { clause, values } = buildSetClause(campos, EDITABLE_COLUMNS);
  if (!clause) return 0;
  const result = await db.query(`UPDATE entrenadores SET ${clause} WHERE entrenador_id = $${values.length + 1}`, [
    ...values,
    entrenador_id,
  ]);
  return result.rowCount;
};

module.exports = {
  EDITABLE_COLUMNS,
  crearEntrenador,
  buscarCredencialesPorCorreo,
  buscarEntrenadorPorId,
  obtenerEntrenadoresDelClub,
  eliminarEntrenadorPorId,
  actualizarEntrenador,
};
