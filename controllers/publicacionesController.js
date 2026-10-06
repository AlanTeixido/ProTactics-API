const Publicacion = require('../models/Publicacion');
const { perteneceAlEntrenador } = require('../models/Entrenamiento');
const { toInterval } = require('../utils/validation');

const emptyToNull = (value) => (value === '' ? null : value);

// GET /publicaciones (public feed)
const obtenerTodasPublicaciones = async (req, res) => {
  res.json(await Publicacion.obtenerPublicaciones());
};

// GET /publicaciones/:id (public)
const obtenerPublicacionPorId = async (req, res) => {
  const publicacion = await Publicacion.obtenerPublicacionPorId(Number(req.params.id));
  if (!publicacion) return res.status(404).json({ error: 'Publicación no encontrada.' });
  return res.json(publicacion);
};

// POST /publicaciones (coach of a club)
const crearNuevaPublicacion = async (req, res) => {
  if (!req.user.club_id) {
    return res.status(403).json({ error: 'Solo los entrenadores de club pueden publicar.' });
  }

  const { titulo, contenido, imagen_url, entrenamiento_id } = req.body;
  if (entrenamiento_id && !(await perteneceAlEntrenador(entrenamiento_id, req.user.id))) {
    return res.status(404).json({ error: 'Entrenamiento no encontrado.' });
  }

  const nuevaPublicacion = await Publicacion.crearPublicacion(
    req.user.id,
    titulo.trim(),
    contenido,
    imagen_url,
    entrenamiento_id || null
  );
  return res.status(201).json(nuevaPublicacion);
};

// POST /publicaciones/desde-entrenamiento (coach of a club, own sessions only)
const subirPublicacionDesdeEntrenamiento = async (req, res) => {
  if (!req.user.club_id) {
    return res.status(403).json({ error: 'Solo los entrenadores de club pueden publicar.' });
  }

  const body = req.body;
  if (!(await perteneceAlEntrenador(body.entrenamiento_id, req.user.id))) {
    return res.status(404).json({ error: 'Entrenamiento no encontrado.' });
  }

  const publicacion = await Publicacion.crearPublicacionDesdeEntrenamiento({
    entrenador_id: req.user.id,
    entrenamiento_id: body.entrenamiento_id,
    titulo: body.titulo.trim(),
    contenido: body.contenido,
    imagen_url: body.imagen_url,
    categoria: emptyToNull(body.categoria),
    campo: emptyToNull(body.campo),
    fecha_entrenamiento: body.fecha_entrenamiento,
    duracion_repeticion: toInterval(body.duracion_repeticion),
    repeticiones: emptyToNull(body.repeticiones),
    total_duracion: toInterval(body.total_duracion),
    descanso: emptyToNull(body.descanso),
    notas_adicionales: emptyToNull(body.notas_adicionales),
  });
  return res.status(201).json(publicacion);
};

// DELETE /publicaciones/:id (author only)
const eliminarPublicacionPorId = async (req, res) => {
  if (!req.user.club_id) {
    return res.status(403).json({ error: 'Solo los entrenadores de club pueden eliminar publicaciones.' });
  }

  const deleted = await Publicacion.eliminarPublicacion(Number(req.params.id), req.user.id);
  if (!deleted) return res.status(404).json({ error: 'Publicación no encontrada.' });
  return res.json({ mensaje: 'Publicación eliminada correctamente.' });
};

// POST /publicaciones/:id/like (coach of a club)
const likePublicacion = async (req, res) => {
  if (!req.user.club_id) {
    return res.status(403).json({ error: 'Solo los entrenadores de club pueden dar like.' });
  }

  const id = Number(req.params.id);
  if (!(await Publicacion.existePublicacion(id))) {
    return res.status(404).json({ error: 'Publicación no encontrada.' });
  }
  await Publicacion.darLike(id, req.user.id);
  return res.json({ mensaje: 'Like añadido.' });
};

// DELETE /publicaciones/:id/like (coach of a club)
const unlikePublicacion = async (req, res) => {
  if (!req.user.club_id) {
    return res.status(403).json({ error: 'Solo los entrenadores de club pueden quitar like.' });
  }

  await Publicacion.quitarLike(Number(req.params.id), req.user.id);
  return res.json({ mensaje: 'Like eliminado.' });
};

module.exports = {
  obtenerTodasPublicaciones,
  obtenerPublicacionPorId,
  crearNuevaPublicacion,
  subirPublicacionDesdeEntrenamiento,
  eliminarPublicacionPorId,
  likePublicacion,
  unlikePublicacion,
};
