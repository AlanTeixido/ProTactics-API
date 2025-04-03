const db = require('../requests/db');

const crearEntrenamiento = async (entrenador_id, titulo, descripcion, categoria, campo, fecha_entrenamiento, duracion_repeticion, repeticiones) => {
  const result = await db.query(
    `INSERT INTO entrenamientos (entrenador_id, titulo, descripcion, categoria, campo, fecha_entrenamiento, duracion_repeticion, repeticiones)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [entrenador_id, titulo, descripcion, categoria, campo, fecha_entrenamiento, duracion_repeticion, repeticiones]
  );
  return result.rows[0];
};

const relacionarJugadores = async (entrenamiento_id, jugadores) => {
  const inserts = jugadores.map(jugador_id => `(${entrenamiento_id}, ${jugador_id})`).join(',');
  await db.query(
    `INSERT INTO entrenamiento_jugadores (entrenamiento_id, jugador_id) VALUES ${inserts}`
  );
};

const obtenerEntrenamientosPorEntrenador = async (entrenador_id) => {
  const result = await db.query(
    'SELECT * FROM entrenamientos WHERE entrenador_id = $1 ORDER BY creado_en DESC',
    [entrenador_id]
  );
  return result.rows;
};

const obtenerEntrenamientoPorId = async (entrenamiento_id) => {
  const result = await db.query(
    `SELECT * FROM entrenamientos WHERE entrenamiento_id = $1`,
    [entrenamiento_id]
  );
  return result.rows[0];
};

const obtenerJugadoresDelEntrenamiento = async (entrenamiento_id) => {
  const result = await db.query(
    `SELECT j.* FROM jugadores j
     INNER JOIN entrenamiento_jugadores ej ON j.jugador_id = ej.jugador_id
     WHERE ej.entrenamiento_id = $1`,
    [entrenamiento_id]
  );
  return result.rows;
};

const actualizarEntrenamiento = async (entrenamiento_id, entrenador_id, datos) => {
  const { titulo, descripcion, categoria, campo, fecha_entrenamiento, duracion_repeticion, repeticiones } = datos;
  await db.query(
    `UPDATE entrenamientos
     SET titulo = $1, descripcion = $2, categoria = $3, campo = $4,
         fecha_entrenamiento = $5, duracion_repeticion = $6, repeticiones = $7
     WHERE entrenamiento_id = $8 AND entrenador_id = $9`,
    [titulo, descripcion, categoria, campo, fecha_entrenamiento, duracion_repeticion, repeticiones, entrenamiento_id, entrenador_id]
  );
};

const eliminarEntrenamiento = async (entrenamiento_id, entrenador_id) => {
  await db.query(
    `DELETE FROM entrenamientos WHERE entrenamiento_id = $1 AND entrenador_id = $2`,
    [entrenamiento_id, entrenador_id]
  );
};

module.exports = {
  crearEntrenamiento,
  relacionarJugadores,
  obtenerEntrenamientosPorEntrenador,
  obtenerEntrenamientoPorId,
  obtenerJugadoresDelEntrenamiento,
  actualizarEntrenamiento,
  eliminarEntrenamiento
};
