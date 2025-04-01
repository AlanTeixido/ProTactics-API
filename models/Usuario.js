// models/Usuario.js
const db = require("../requests/db");

const obtenerResumenUsuario = async (userId, rol) => {
  if (rol === "entrenador") {
    const result = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM entrenamientos WHERE entrenador_id = $1) AS trainings,
        (SELECT COUNT(*) FROM publicaciones WHERE entrenador_id = $1) AS shared,
        (SELECT COUNT(*) FROM seguidores WHERE seguido_id = $1) AS followers
    `, [userId]);

    return result.rows[0];
  } else if (rol === "club") {
    const result = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM entrenadores WHERE club_id = $1) AS entrenadores,
        (SELECT COUNT(*) FROM publicaciones WHERE club_id = $1) AS shared
    `, [userId]);

    return result.rows[0];
  }

  return null;
};

module.exports = {
  obtenerResumenUsuario
};