const db = require('../requests/db');

const obtenerPublicaciones = async () => {
    const result = await db.query(`
        SELECT p.*, e.nombre AS entrenador
        FROM publicaciones p
        JOIN entrenadores e ON p.entrenador_id = e.entrenador_id
        ORDER BY p.creado_en DESC
    `);
    return result.rows;
};

const crearPublicacion = async (entrenador_id, titulo, contenido, imagen_url, entrenamiento_id) => {
    const result = await db.query(
        'INSERT INTO publicaciones (entrenador_id, titulo, contenido, imagen_url, entrenamiento_id, creado_en) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
        [entrenador_id, titulo, contenido, imagen_url || 'default.png', entrenamiento_id]
    );
    return result.rows[0];
};

const eliminarPublicacion = async (publicacion_id, entrenador_id) => {
    await db.query('DELETE FROM publicaciones WHERE publicacion_id = $1 AND entrenador_id = $2', [publicacion_id, entrenador_id]);
};

const darLike = async (publicacion_id, entrenador_id) => {
    await db.query('INSERT INTO likes (entrenador_id, publicacion_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [entrenador_id, publicacion_id]);
};

const quitarLike = async (publicacion_id, entrenador_id) => {
    await db.query('DELETE FROM likes WHERE entrenador_id = $1 AND publicacion_id = $2', [entrenador_id, publicacion_id]);
};

module.exports = {
    obtenerPublicaciones,
    crearPublicacion,
    eliminarPublicacion,
    darLike,
    quitarLike
};