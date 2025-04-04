const db = require('../requests/db');

const crearEntrenamiento = async (
    entrenador_id, titulo, descripcion, categoria, campo,
    fecha_entrenamiento, duracion_repeticion, repeticiones,
    descanso, valoracion, imagen_url, notas
) => {
    if (typeof duracion_repeticion === 'object' && duracion_repeticion.minutes) {
        // Asegura que duracion_repeticion sea un string en formato intervalo
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
    

    return result.rows[0]; // Retorna el entrenamiento creado
};

const relacionarJugadores = async (entrenamiento_id, jugadores) => {
    const inserts = jugadores.map(j => `(${entrenamiento_id}, ${j})`).join(',');
    await db.query(
        `INSERT INTO entrenamiento_jugadores (entrenamiento_id, jugador_id) VALUES ${inserts}`
    );
};

module.exports = {
    crearEntrenamiento,
    relacionarJugadores
};
