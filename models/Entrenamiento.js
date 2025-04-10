const db = require('../requests/db');

// Crear entrenamiento
const crearEntrenamiento = async (
  entrenador_id, titulo, descripcion, categoria, campo,
  fecha_entrenamiento, duracion_repeticion, repeticiones,
  descanso, valoracion, imagen_url, notas
) => {
  if (typeof duracion_repeticion === 'object' && duracion_repeticion.minutes) {
    duracion_repeticion = `${duracion_repeticion.minutes} minutes`;
  }

  const result = await db.query(
    `INSERT INTO entrenamientos (
      entrenador_id, titulo, descripcion, categoria, campo,
      fecha_entrenamiento, duracion_repeticion, repeticiones,
      descanso, valoracion, imagen_url, notas
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      entrenador_id, titulo, descripcion, categoria, campo,
      fecha_entrenamiento, duracion_repeticion, repeticiones,
      descanso, valoracion, imagen_url, notas
    ]
  );

  return result.rows[0];
};

// Editar entrenamiento
const editarEntrenamiento = async (entrenamiento_id, entrenador_id, datos) => {
  const {
    titulo, descripcion, categoria, campo, fecha_entrenamiento,
    duracion_repeticion, repeticiones, descanso,
    valoracion, imagen_url, notas
  } = datos;

  await db.query(
    `UPDATE entrenamientos SET
      titulo = $1, descripcion = $2, categoria = $3, campo = $4,
      fecha_entrenamiento = $5, duracion_repeticion = $6,
      repeticiones = $7, descanso = $8, valoracion = $9,
      imagen_url = $10, notas = $11
      WHERE entrenamiento_id = $12 AND entrenador_id = $13`,
    [
      titulo, descripcion, categoria, campo, fecha_entrenamiento,
      duracion_repeticion, repeticiones, descanso,
      valoracion, imagen_url, notas,
      entrenamiento_id, entrenador_id
    ]
  );
};

// Eliminar entrenamiento
const eliminarEntrenamiento = async (entrenamiento_id, entrenador_id) => {
  await db.query(
    `DELETE FROM entrenamientos WHERE entrenamiento_id = $1 AND entrenador_id = $2`,
    [entrenamiento_id, entrenador_id]
  );
};

// Obtener entrenamientos por entrenador
const obtenerEntrenamientosPorEntrenador = async (entrenador_id) => {
  const result = await db.query(
    'SELECT * FROM entrenamientos WHERE entrenador_id = $1 ORDER BY creado_en DESC',
    [entrenador_id]
  );
  return result.rows;
};

// ✅ NUEVO: Relacionar jugadores
const relacionarJugadores = async (entrenamiento_id, jugadores) => {
  const valores = jugadores.map(jugador_id => `(${entrenamiento_id}, ${jugador_id})`).join(',');
  await db.query(`INSERT INTO entrenamiento_jugadores (entrenamiento_id, jugador_id) VALUES ${valores}`);
};

module.exports = {
  crearEntrenamiento,
  editarEntrenamiento,
  eliminarEntrenamiento,
  obtenerEntrenamientosPorEntrenador,
  relacionarJugadores
};
