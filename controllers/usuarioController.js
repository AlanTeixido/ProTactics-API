const db = require('../requests/db');

const obtenerResumenUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const resultUsuario = await db.query(
      'SELECT id, username, email, rol FROM usuarios WHERE id = $1',
      [id]
    );

    if (resultUsuario.rows.length === 0) {
      return res.status(404).json({ error: 'Usuari no trobat' });
    }

    const usuario = resultUsuario.rows[0];
    const resumen = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      shared: 0,
      trainings: 0,
      followers: 0,
      likes: 0
    };

    if (usuario.rol === 'entrenador') {
      const entrenamientos = await db.query(
        'SELECT COUNT(*) FROM entrenamientos WHERE entrenador_id = $1',
        [id]
      );
      const publicaciones = await db.query(
        'SELECT COUNT(*) FROM publicaciones WHERE autor_id = $1',
        [id]
      );
      const likes = await db.query(
        'SELECT COUNT(*) FROM likes WHERE autor_id = $1',
        [id]
      );
      resumen.trainings = parseInt(entrenamientos.rows[0].count);
      resumen.shared = parseInt(publicaciones.rows[0].count);
      resumen.likes = parseInt(likes.rows[0].count);
    } else if (usuario.rol === 'club') {
      const entrenadors = await db.query(
        'SELECT COUNT(*) FROM entrenadores WHERE club_id = $1',
        [id]
      );
      const followers = await db.query(
        'SELECT COUNT(*) FROM seguidores WHERE seguido_id = $1',
        [id]
      );
      resumen.entrenadores = parseInt(entrenadors.rows[0].count);
      resumen.followers = parseInt(followers.rows[0].count);
    }

    res.json(resumen);
  } catch (error) {
    console.error("❌ Error obtenint resum:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  obtenerResumenUsuario
};
