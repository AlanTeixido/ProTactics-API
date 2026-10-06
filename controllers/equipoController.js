const Equipo = require('../models/Equipo');

// POST /equipos (club)
const crearEquipoController = async (req, res) => {
  const { nombre, categoria } = req.body;
  const nuevoEquipo = await Equipo.crearEquipo(nombre.trim(), categoria.trim(), req.user.id);
  res.status(201).json({ message: 'Equip creat correctament', equipo: nuevoEquipo });
};

// GET /equipos and GET /equipos/mis-equipos: a club gets its teams,
// a coach gets the teams of their club.
const obtenerEquipos = async (req, res) => {
  const { id, tipo } = req.user;
  const equipos = tipo === 'club' ? await Equipo.obtenerEquiposDelClub(id) : await Equipo.obtenerEquiposDelEntrenador(id);
  res.json(equipos);
};

// GET /equipos/entrenador (coach)
const obtenerEquiposPorEntrenador = async (req, res) => {
  res.json(await Equipo.obtenerEquiposDelEntrenador(req.user.id));
};

// PUT /equipos/:id (club, own teams only)
const editarEquipo = async (req, res) => {
  const { nombre, categoria } = req.body;
  if (nombre === undefined && categoria === undefined) {
    return res.status(400).json({ error: 'No hi ha cap camp per actualitzar.' });
  }

  const updated = await Equipo.actualizarEquipoDB(Number(req.params.id), req.user.id, {
    nombre: nombre?.trim(),
    categoria: categoria?.trim(),
  });
  if (!updated) return res.status(404).json({ error: 'Equip no trobat.' });
  return res.json({ message: 'Equip actualitzat correctament' });
};

// DELETE /equipos/:id (club, own teams only)
const eliminarEquipo = async (req, res) => {
  const deleted = await Equipo.eliminarEquipoDB(Number(req.params.id), req.user.id);
  if (!deleted) return res.status(404).json({ error: 'Equip no trobat.' });
  return res.json({ message: 'Equip eliminat correctament' });
};

module.exports = {
  crearEquipoController,
  obtenerEquipos,
  obtenerEquiposPorEntrenador,
  editarEquipo,
  eliminarEquipo,
};
