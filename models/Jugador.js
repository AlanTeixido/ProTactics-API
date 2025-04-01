const db = require('../requests/db');

const crearJugador = async (nombre, apellido, dorsal, posicion, entrenador_id) => {
  const result = await db.query(
    'INSERT INTO jugadores (nombre, apellido, dorsal, posicion, entrenador_id) VALUES ($1, $2, $3, $4, $5) RETURNING jugador_id, nombre, apellido, dorsal, posicion, entrenador_id',
    [nombre, apellido, dorsal, posicion, entrenador_id]
  );
  return result.rows[0];
};

const buscarJugadorPorDorsal = async (dorsal) => {
  const result = await db.query(
    'SELECT * FROM jugadores WHERE dorsal = $1',
    [dorsal]
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

const actualizarJugadorDB = async (nombre, apellido, posicion, dorsal, jugador_id, entrenador_id) => {
  await db.query(
    'UPDATE jugadores SET nombre=$1, apellido=$2, posicion=$3, dorsal=$4 WHERE jugador_id=$5 AND entrenador_id=$6',
    [nombre, apellido, posicion, dorsal, jugador_id, entrenador_id]
  );
};

module.exports = {
  crearJugador,
  buscarJugadorPorDorsal,
  obtenerJugadoresDelEntrenador,
  eliminarJugadorPorId,
  obtenerJugadorPorIdDB,
  actualizarJugadorDB
};