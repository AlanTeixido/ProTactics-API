const {
    obtenerPublicaciones,
    obtenerPublicacionPorId: obtenerPublicacionPorIdModel, 
    crearPublicacion,
    eliminarPublicacion,
    darLike,
    quitarLike
} = require('../models/Publicacion');


const obtenerTodasPublicaciones = async (req, res) => {
    try {
        const publicaciones = await obtenerPublicaciones();
        res.json(publicaciones);
    } catch (error) {
        console.error("Error obteniendo publicaciones:", error);
        res.status(500).json({ error: "Error del servidor." });
    }
};

const obtenerPublicacionPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const publicacion = await obtenerPublicacionPorIdModel(id);
        if (!publicacion) {
            return res.status(404).json({ error: "Publicación no encontrada." });
        }
        res.json(publicacion);
    } catch (error) {
        console.error("Error obteniendo publicación por ID:", error);
        res.status(500).json({ error: "Error del servidor." });
    }
};


const crearNuevaPublicacion = async (req, res) => {
    const { titulo, contenido, imagen_url, entrenamiento_id } = req.body;
    const entrenador_id = req.user.id;

    if (!req.user.club_id) {
        return res.status(403).json({ error: "Solo los entrenadores de club pueden publicar." });
    }

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

    if (!req.user.club_id) {
        return res.status(403).json({ error: "Solo los entrenadores de club pueden eliminar publicaciones." });
    }

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

    if (!req.user.club_id) {
        return res.status(403).json({ error: "Solo los entrenadores de club pueden dar like." });
    }

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

    if (!req.user.club_id) {
        return res.status(403).json({ error: "Solo los entrenadores de club pueden quitar like." });
    }

    try {
        await quitarLike(id, entrenador_id);
        res.json({ mensaje: "Like eliminado." });
    } catch (error) {
        res.status(500).json({ error: "Error al quitar like." });
    }
};

module.exports = {
    obtenerTodasPublicaciones,
    obtenerPublicacionPorId,
    crearNuevaPublicacion,
    eliminarPublicacionPorId,
    likePublicacion,
    unlikePublicacion
};
