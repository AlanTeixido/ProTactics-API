const db = require('../requests/db');

// Crear entrenador asociado a un club
const crearEntrenador = async (nombre, correo, password, equipo, club_id) => {
  const result = await db.query(
    `INSERT INTO entrenadores (nombre, correo, password, equipo, club_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING entrenador_id, nombre, correo, equipo, club_id`,
    [nombre, correo, password, equipo, club_id]
  );
  return result.rows[0];
};

// Buscar por correo (para validar duplicados)
const buscarPorCorreo = async (correo) => {
  const result = await db.query('SELECT * FROM entrenadores WHERE correo = $1', [correo]);
  return result.rows[0];
};

// Buscar por ID (individual)
const buscarEntrenadorPorId = async (id) => {
  const result = await db.query('SELECT * FROM entrenadores WHERE entrenador_id = $1', [id]);
  return result.rows[0];
};

// Obtener todos los entrenadores de un club
const obtenerEntrenadoresDelClub = async (club_id) => {
  const result = await db.query(
    'SELECT * FROM entrenadores WHERE club_id = $1 ORDER BY creado_en DESC',
    [club_id]
  );
  return result.rows;
};

// Eliminar entrenador por ID y club
const eliminarEntrenadorPorId = async (entrenador_id, club_id) => {
  await db.query(
    'DELETE FROM entrenadores WHERE entrenador_id = $1 AND club_id = $2',
    [entrenador_id, club_id]
  );
};

// Actualizar datos del entrenador
const actualizarEntrenador = async (
  entrenador_id, nombre, correo, password, equipo, telefono, foto_url, notas, club_id
) => {
  await db.query(
    `UPDATE entrenadores
     SET nombre = $1,
         correo = $2,
         password = COALESCE($3, password),
         equipo = $4,
         telefono = $5,
         foto_url = $6,
         notas = $7
     WHERE entrenador_id = $8 AND club_id = $9`,
    [nombre, correo, password, equipo, telefono, foto_url, notas, entrenador_id, club_id]
  );
};

module.exports = {
  crearEntrenador,
  buscarPorCorreo,
  buscarEntrenadorPorId,
  obtenerEntrenadoresDelClub,
  eliminarEntrenadorPorId,
  actualizarEntrenador
};
