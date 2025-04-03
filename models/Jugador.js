const db = require('../requests/db');

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
  const result = await db.query(
    'SELECT * FROM jugadores WHERE dorsal = $1 AND entrenador_id = $2',
    [dorsal, entrenador_id]
  );
  return result.rows[0];
};

const obtenerJugadoresDelEntrenador = async (entrenador_id) => {
  const result = await db.query(
    'SELECT * FROM jugadores WHERE entrenador_id = $1 ORDER BY creado_en DESC',
    [entrenador_id]
  );
  return result.rows;
};

const eliminarJugadorPorId = async (jugador_id, entrenador_id) => {
  await db.query(
    'DELETE FROM jugadores WHERE jugador_id = $1 AND entrenador_id = $2',
    [jugador_id, entrenador_id]
  );
};

const obtenerJugadorPorIdDB = async (jugador_id, entrenador_id) => {
  const result = await db.query(
    'SELECT * FROM jugadores WHERE jugador_id = $1 AND entrenador_id = $2',
    [jugador_id, entrenador_id]
  );
  return result.rows[0];
};

const actualizarJugadorDB = async (nombre, apellido, posicion, dorsal, equipo_id, jugador_id, entrenador_id) => {
  await db.query(
    `UPDATE jugadores
     SET nombre=$1, apellido=$2, posicion=$3, dorsal=$4, equipo_id=$5
     WHERE jugador_id=$6 AND entrenador_id=$7`,
    [nombre, apellido, posicion, dorsal, equipo_id, jugador_id, entrenador_id]
  );
};

const obtenerJugadoresPorEquipo = async (equipo_id) => {
  const result = await db.query(
    'SELECT * FROM jugadores WHERE equipo_id = $1 ORDER BY creado_en DESC',
    [equipo_id]
  );
  return result.rows;
};


module.exports = {
  crearJugador,
  buscarJugadorPorDorsal,
  obtenerJugadoresDelEntrenador,
  eliminarJugadorPorId,
  obtenerJugadorPorIdDB,
  actualizarJugadorDB,
  obtenerJugadoresPorEquipo
};
