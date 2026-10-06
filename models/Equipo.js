const db = require('../config/db');

const COLUMNS = ['equipo_id', 'nombre', 'categoria', 'club_id', 'entrenador_id', 'creado_en'];
const RETURNING = COLUMNS.join(', ');
const E_COLUMNS = COLUMNS.map((column) => `e.${column}`).join(', ');

const crearEquipo = async (nombre, categoria, club_id) => {
  const result = await db.query(
    `INSERT INTO equipos (nombre, categoria, club_id) VALUES ($1, $2, $3) RETURNING ${RETURNING}`,
    [nombre, categoria, club_id]
  );
  return result.rows[0];
};

const obtenerEquiposDelClub = async (club_id) => {
  const result = await db.query(
    `SELECT ${E_COLUMNS}, en.nombre AS entrenador_nombre
     FROM equipos e
     LEFT JOIN entrenadores en ON e.entrenador_id = en.entrenador_id
     WHERE e.club_id = $1
     ORDER BY e.creado_en DESC`,
    [club_id]
  );
  return result.rows;
};

// Teams of the club the coach belongs to.
const obtenerEquiposDelEntrenador = async (entrenador_id) => {
  const result = await db.query(
    `SELECT ${E_COLUMNS}
     FROM equipos e
     JOIN entrenadores en ON e.club_id = en.club_id
     WHERE en.entrenador_id = $1
     ORDER BY e.creado_en DESC`,
    [entrenador_id]
  );
  return result.rows;
};

// Ownership check: returns the team only if it belongs to the club.
const buscarEquipoDelClub = async (equipo_id, club_id) => {
  const result = await db.query(`SELECT ${RETURNING} FROM equipos WHERE equipo_id = $1 AND club_id = $2`, [
    equipo_id,
    club_id,
  ]);
  return result.rows[0];
};

const actualizarEquipoDB = async (equipo_id, club_id, { nombre, categoria }) => {
  const result = await db.query(
    `UPDATE equipos
     SET nombre = COALESCE($1, nombre), categoria = COALESCE($2, categoria)
     WHERE equipo_id = $3 AND club_id = $4`,
    [nombre ?? null, categoria ?? null, equipo_id, club_id]
  );
  return result.rowCount;
};

const eliminarEquipoDB = async (equipo_id, club_id) => {
  const result = await db.query('DELETE FROM equipos WHERE equipo_id = $1 AND club_id = $2', [equipo_id, club_id]);
  return result.rowCount;
};

// Team of the club with the given category; teams assigned to the coach come first.
const obtenerEquipoIdPorCategoria = async (categoria, club_id, entrenador_id) => {
  const result = await db.query(
    `SELECT equipo_id
     FROM equipos
     WHERE LOWER(categoria) = LOWER($1) AND club_id = $2
     ORDER BY (entrenador_id = $3) DESC NULLS LAST, equipo_id
     LIMIT 1`,
    [categoria.trim(), club_id, entrenador_id]
  );
  return result.rows[0]?.equipo_id || null;
};

module.exports = {
  crearEquipo,
  obtenerEquiposDelClub,
  obtenerEquiposDelEntrenador,
  buscarEquipoDelClub,
  actualizarEquipoDB,
  eliminarEquipoDB,
  obtenerEquipoIdPorCategoria,
};
