// models/Jugador.js
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

module.exports = {
  crearJugador,
  buscarJugadorPorDorsal,
  obtenerJugadoresDelEntrenador
};
