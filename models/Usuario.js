// Queries that span both account types (clubs and coaches).
const db = require('../config/db');

const obtenerResumenUsuario = async (userId, rol) => {
  if (rol === 'entrenador') {
    const result = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM entrenamientos WHERE entrenador_id = $1) AS trainings,
         (SELECT COUNT(*) FROM publicaciones WHERE entrenador_id = $1) AS shared,
         (SELECT COUNT(*) FROM seguidores WHERE seguido_id = $1) AS followers`,
      [userId]
    );
    return result.rows[0];
  }

  if (rol === 'club') {
    // Posts belong to coaches; a club's posts are those of its coaches.
    const result = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM entrenadores WHERE club_id = $1) AS entrenadores,
         (SELECT COUNT(*)
            FROM publicaciones p
            JOIN entrenadores e ON p.entrenador_id = e.entrenador_id
           WHERE e.club_id = $1) AS shared`,
      [userId]
    );
    return result.rows[0];
  }

  return null;
};

// Emails must be unique across clubs and coaches: login looks in both tables.
const correoEnUso = async (correo, { exceptClubId = null, exceptEntrenadorId = null } = {}) => {
  const result = await db.query(
    `SELECT 1 FROM clubs
      WHERE LOWER(correo) = LOWER($1) AND club_id IS DISTINCT FROM $2::int
     UNION ALL
     SELECT 1 FROM entrenadores
      WHERE LOWER(correo) = LOWER($1) AND entrenador_id IS DISTINCT FROM $3::int
     LIMIT 1`,
    [correo, exceptClubId, exceptEntrenadorId]
  );
  return result.rows.length > 0;
};

module.exports = {
  obtenerResumenUsuario,
  correoEnUso,
};
