const { crearPublicacion, obtenerPublicaciones, eliminarPublicacion, darLike, quitarLike } = require('../models/Publicacion');

const obtenerTodasPublicaciones = async (req, res) => {
    try {
        const publicaciones = await obtenerPublicaciones();
        res.json(publicaciones);
    } catch (error) {
        console.error("Error obteniendo publicaciones:", error);
        res.status(500).json({ error: "Error del servidor." });
    }
};

const crearNuevaPublicacion = async (req, res) => {
    const { titulo, contenido, imagen_url, entrenamiento_id } = req.body;
    const entrenador_id = req.user.id;

    if (!titulo || !contenido) {
        return res.status(400).json({ error: "Título y contenido son obligatorios." });
    }

    try {
        const nuevaPublicacion = await crearPublicacion(entrenador_id, titulo, contenido, imagen_url, entrenamiento_id);
        res.status(201).json(nuevaPublicacion);
    } catch (error) {
        console.error("Error creando la publicación:", error);
        res.status(500).json({ error: "Error del servidor." });
    }
};

const eliminarPublicacionPorId = async (req, res) => {
    const { id } = req.params;
    const entrenador_id = req.user.id;

    try {
        await eliminarPublicacion(id, entrenador_id);
        res.json({ mensaje: "Publicación eliminada correctamente." });
    } catch (error) {
        res.status(500).json({ error: "Error eliminando la publicación." });
    }
};

const likePublicacion = async (req, res) => {
    const { id } = req.params;
    const entrenador_id = req.user.id;

    try {
        await darLike(id, entrenador_id);
        res.json({ mensaje: "Like añadido." });
    } catch (error) {
        res.status(500).json({ error: "Error al dar like." });
    }
};

const unlikePublicacion = async (req, res) => {
    const { id } = req.params;
    const entrenador_id = req.user.id;

    try {
        await quitarLike(id, entrenador_id);
        res.json({ mensaje: "Like eliminado." });
    } catch (error) {
        res.status(500).json({ error: "Error al quitar like." });
    }
};

module.exports = {
    obtenerTodasPublicaciones,
    crearNuevaPublicacion,
    eliminarPublicacionPorId,
    likePublicacion,
    unlikePublicacion
};