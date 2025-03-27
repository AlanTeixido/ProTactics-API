const db = require('../requests/db');

// Crear entrenador
const crearEntrenador = async (nombre, correo, password) => {
  const result = await db.query(
    'INSERT INTO entrenadores (nombre, correo, password) VALUES ($1, $2, $3) RETURNING *',
    [nombre, correo, password]
  );
  return result.rows[0];
};

// Buscar entrenador por correo
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
