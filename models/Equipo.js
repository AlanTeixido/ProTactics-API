const db = require('../requests/db');

const crearEquipo = async (nombre, categoria, club_id) => {
    // 🔎 Busca un entrenador del club (pots millorar la lògica si tens més d’un entrenador)
    const resultEntrenador = await db.query(
      'SELECT entrenador_id FROM entrenadores WHERE club_id = $1 LIMIT 1',
      [club_id]
    );
  
    if (resultEntrenador.rows.length === 0) {
      throw new Error('No s\'ha trobat cap entrenador pel club');
    }
  
    const entrenador_id = resultEntrenador.rows[0].entrenador_id;
  
    const result = await db.query(
      'INSERT INTO equipos (nombre, categoria, entrenador_id, club_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, categoria, entrenador_id, club_id]
    );
  
    return result.rows[0];
  };
  
  
const obtenerEquiposDelClub = async (club_id) => {
  const result = await db.query(
    `SELECT e.*, en.nombre AS entrenador_nombre
     FROM equipos e
     JOIN entrenadores en ON e.entrenador_id = en.entrenador_id
     WHERE en.club_id = $1
     ORDER BY e.creado_en DESC`,
    [club_id]
  );
  return result.rows;
};

const actualizarEquipoDB = async (equipo_id, club_id, nombre, categoria) => {
  await db.query(
    `UPDATE equipos
     SET nombre = $1, categoria = $2
     WHERE equipo_id = $3 AND entrenador_id IN (
        SELECT entrenador_id FROM entrenadores WHERE club_id = $4
     )`,
    [nombre, categoria, equipo_id, club_id]
  );
};

const eliminarEquipoDB = async (equipo_id, club_id) => {
  await db.query(
    `DELETE FROM equipos
     WHERE equipo_id = $1 AND entrenador_id IN (
       SELECT entrenador_id FROM entrenadores WHERE club_id = $2
     )`,
    [equipo_id, club_id]
  );
};

module.exports = {
  crearEquipo,
  obtenerEquiposDelClub,
  actualizarEquipoDB,
  eliminarEquipoDB
};
