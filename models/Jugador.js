const db = require('../config/db');
const { buildSetClause } = require('../utils/sql');

const COLUMNS = ['jugador_id', 'nombre', 'apellido', 'dorsal', 'posicion', 'entrenador_id', 'equipo_id', 'creado_en'];
const SELECT_COLUMNS = COLUMNS.join(', ');
const J_COLUMNS = COLUMNS.map((column) => `j.${column}`).join(', ');
const EDITABLE_COLUMNS = ['nombre', 'apellido', 'posicion', 'dorsal', 'equipo_id'];

const crearJugador = async (nombre, apellido, dorsal, posicion, entrenador_id, equipo_id) => {
  const result = await db.query(
    `INSERT INTO jugadores (nombre, apellido, dorsal, posicion, entrenador_id, equipo_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING jugador_id, nombre, apellido, dorsal, posicion, entrenador_id, equipo_id`,
    [nombre, apellido, dorsal, posicion, entrenador_id, equipo_id]
  );
  return result.rows[0];
};

const buscarJugadorPorDorsal = async (dorsal, entrenador_id) => {
  const result = await db.query('SELECT jugador_id FROM jugadores WHERE dorsal = $1 AND entrenador_id = $2', [
    dorsal,
    entrenador_id,
  ]);
  return result.rows[0];
};

const obtenerJugadoresDelEntrenador = async (entrenador_id) => {
  const result = await db.query(
    `SELECT ${SELECT_COLUMNS} FROM jugadores WHERE entrenador_id = $1 ORDER BY creado_en DESC`,
    [entrenador_id]
  );
  return result.rows;
};

// Players of every team of the club.
const obtenerJugadoresDelClub = async (club_id) => {
  const result = await db.query(
    `SELECT ${J_COLUMNS}
     FROM jugadores j
     JOIN equipos eq ON j.equipo_id = eq.equipo_id
     WHERE eq.club_id = $1
     ORDER BY j.creado_en DESC`,
    [club_id]
  );
  return result.rows;
};

const obtenerJugadorPorIdDB = async (jugador_id, entrenador_id) => {
  const result = await db.query(`SELECT ${SELECT_COLUMNS} FROM jugadores WHERE jugador_id = $1 AND entrenador_id = $2`, [
    jugador_id,
    entrenador_id,
  ]);
  return result.rows[0];
};

const obtenerJugadorDelClub = async (jugador_id, club_id) => {
  const result = await db.query(
    `SELECT ${J_COLUMNS}
     FROM jugadores j
     JOIN equipos eq ON j.equipo_id = eq.equipo_id
     WHERE j.jugador_id = $1 AND eq.club_id = $2`,
    [jugador_id, club_id]
  );
  return result.rows[0];
};

const obtenerJugadoresPorEquipo = async (equipo_id) => {
  const result = await db.query(`SELECT ${SELECT_COLUMNS} FROM jugadores WHERE equipo_id = $1 ORDER BY creado_en DESC`, [
    equipo_id,
  ]);
  return result.rows;
};

// Partial update restricted to the coach's own players.
const actualizarJugadorDB = async (jugador_id, entrenador_id, campos) => {
  const { clause, values } = buildSetClause(campos, EDITABLE_COLUMNS);
  if (!clause) return 0;
  const n = values.length;
  const result = await db.query(
    `UPDATE jugadores SET ${clause} WHERE jugador_id = $${n + 1} AND entrenador_id = $${n + 2}`,
    [...values, jugador_id, entrenador_id]
  );
  return result.rowCount;
};

const eliminarJugadorPorId = async (jugador_id, entrenador_id) => {
  const result = await db.query('DELETE FROM jugadores WHERE jugador_id = $1 AND entrenador_id = $2', [
    jugador_id,
    entrenador_id,
  ]);
  return result.rowCount;
};

// How many of the given player ids belong to teams of the club.
const contarJugadoresDelClub = async (jugadorIds, club_id) => {
  const result = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM jugadores j
     JOIN equipos eq ON j.equipo_id = eq.equipo_id
     WHERE j.jugador_id = ANY($1::int[]) AND eq.club_id = $2`,
    [jugadorIds, club_id]
  );
  return result.rows[0].total;
};

module.exports = {
  EDITABLE_COLUMNS,
  crearJugador,
  buscarJugadorPorDorsal,
  obtenerJugadoresDelEntrenador,
  obtenerJugadoresDelClub,
  obtenerJugadorPorIdDB,
  obtenerJugadorDelClub,
  obtenerJugadoresPorEquipo,
  actualizarJugadorDB,
  eliminarJugadorPorId,
  contarJugadoresDelClub,
};
