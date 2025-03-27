const db = require('../requests/db');

// Crear entrenador
const crearEntrenador = async (nombre, correo, password, equipo, club_id) => {
  const result = await db.query(
    'INSERT INTO entrenadores (nombre, correo, password, equipo, club_id) VALUES ($1, $2, $3, $4, $5) RETURNING entrenador_id, nombre, correo, equipo, club_id',
    [nombre, correo, password, equipo, club_id]
  );
  return result.rows[0];
};

// Buscar entrenador per correu
const buscarPorCorreo = async (correo) => {
  const result = await db.query(
    'SELECT * FROM entrenadores WHERE correo = $1',
    [correo]
  );
  return result.rows[0];
};

module.exports = {
  crearEntrenador,
  buscarPorCorreo
};
