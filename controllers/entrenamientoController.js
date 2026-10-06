const Entrenamiento = require('../models/Entrenamiento');
const Jugador = require('../models/Jugador');
const { pickDefined, toInterval } = require('../utils/validation');

const normalitzarDades = (body) => {
  const dades = pickDefined(body, Entrenamiento.EDITABLE_COLUMNS);
  if (dades.duracion_repeticion !== undefined) dades.duracion_repeticion = toInterval(dades.duracion_repeticion);
  if (typeof dades.titulo === 'string') dades.titulo = dades.titulo.trim();
  return dades;
};

// POST /entrenamientos (coach). Linked players must belong to the coach's club.
const crearEntrenamientoController = async (req, res) => {
  const jugadores = [...new Set((req.body.jugadores || []).map(Number))];

  if (jugadores.length > 0) {
    const propis = await Jugador.contarJugadoresDelClub(jugadores, req.user.club_id);
    if (propis !== jugadores.length) {
      return res.status(400).json({ error: 'Algun jugador no existeix o no pertany al teu club.' });
    }
  }

  const nuevoEntrenamiento = await Entrenamiento.crearEntrenamiento(req.user.id, normalitzarDades(req.body), jugadores);
  return res.status(201).json({ message: 'Entrenamiento creado', entrenamiento: nuevoEntrenamiento });
};

// PUT /entrenamientos/:id (coach, own sessions only). Partial update.
const editarEntrenamientoController = async (req, res) => {
  const dades = normalitzarDades(req.body);
  if (Object.keys(dades).length === 0) {
    return res.status(400).json({ error: 'No hi ha cap camp per actualitzar.' });
  }

  const updated = await Entrenamiento.editarEntrenamiento(Number(req.params.id), req.user.id, dades);
  if (!updated) return res.status(404).json({ error: 'Entrenament no trobat.' });
  return res.status(200).json({ message: 'Entrenamiento actualizado correctamente' });
};

// DELETE /entrenamientos/:id (coach, own sessions only)
const eliminarEntrenamientoController = async (req, res) => {
  const deleted = await Entrenamiento.eliminarEntrenamiento(Number(req.params.id), req.user.id);
  if (!deleted) return res.status(404).json({ error: 'Entrenament no trobat.' });
  return res.status(200).json({ message: 'Entrenamiento eliminado correctamente' });
};

// GET /entrenamientos (coach)
const obtenerEntrenamientosController = async (req, res) => {
  res.status(200).json(await Entrenamiento.obtenerEntrenamientosPorEntrenador(req.user.id));
};

module.exports = {
  crearEntrenamientoController,
  editarEntrenamientoController,
  eliminarEntrenamientoController,
  obtenerEntrenamientosController,
};
