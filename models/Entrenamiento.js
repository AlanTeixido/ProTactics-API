const db = require('../config/db');
const { buildSetClause } = require('../utils/sql');

const COLUMNS = [
  'entrenamiento_id',
  'entrenador_id',
  'titulo',
  'descripcion',
  'categoria',
  'campo',
  'fecha_entrenamiento',
  'duracion_repeticion',
  'repeticiones',
  'descanso',
  'total_duracion',
  'valoracion',
  'imagen_url',
  'notas',
  'creado_en',
].join(', ');

const EDITABLE_COLUMNS = [
  'titulo',
  'descripcion',
  'categoria',
  'campo',
  'fecha_entrenamiento',
  'duracion_repeticion',
  'repeticiones',
  'descanso',
  'valoracion',
  'imagen_url',
  'notas',
];

// Creates the session and links the given players in a single transaction.
const crearEntrenamiento = async (entrenador_id, datos, jugadorIds = []) => {
  const columns = ['entrenador_id', ...EDITABLE_COLUMNS];
  const values = [entrenador_id, ...EDITABLE_COLUMNS.map((column) => datos[column] ?? null)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO entrenamientos (${columns.join(', ')}) VALUES (${placeholders}) RETURNING ${COLUMNS}`,
      values
    );
    const entrenamiento = result.rows[0];

    if (jugadorIds.length > 0) {
      await client.query(
        `INSERT INTO entrenamiento_jugadores (entrenamiento_id, jugador_id)
         SELECT $1, UNNEST($2::int[])
         ON CONFLICT DO NOTHING`,
        [entrenamiento.entrenamiento_id, jugadorIds]
      );
    }

    await client.query('COMMIT');
    return entrenamiento;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Partial update restricted to the coach's own sessions.
const editarEntrenamiento = async (entrenamiento_id, entrenador_id, datos) => {
  const { clause, values } = buildSetClause(datos, EDITABLE_COLUMNS);
  if (!clause) return 0;
  const n = values.length;
  const result = await db.query(
    `UPDATE entrenamientos SET ${clause} WHERE entrenamiento_id = $${n + 1} AND entrenador_id = $${n + 2}`,
    [...values, entrenamiento_id, entrenador_id]
  );
  return result.rowCount;
};

const eliminarEntrenamiento = async (entrenamiento_id, entrenador_id) => {
  const result = await db.query('DELETE FROM entrenamientos WHERE entrenamiento_id = $1 AND entrenador_id = $2', [
    entrenamiento_id,
    entrenador_id,
  ]);
  return result.rowCount;
};

const obtenerEntrenamientosPorEntrenador = async (entrenador_id) => {
  const result = await db.query(
    `SELECT ${COLUMNS} FROM entrenamientos WHERE entrenador_id = $1 ORDER BY creado_en DESC`,
    [entrenador_id]
  );
  return result.rows;
};

const perteneceAlEntrenador = async (entrenamiento_id, entrenador_id) => {
  const result = await db.query('SELECT 1 FROM entrenamientos WHERE entrenamiento_id = $1 AND entrenador_id = $2', [
    entrenamiento_id,
    entrenador_id,
  ]);
  return result.rows.length > 0;
};

module.exports = {
  EDITABLE_COLUMNS,
  crearEntrenamiento,
  editarEntrenamiento,
  eliminarEntrenamiento,
  obtenerEntrenamientosPorEntrenador,
  perteneceAlEntrenador,
};
