const bcrypt = require('bcryptjs');
const Entrenador = require('../models/Entrenador');
const { correoEnUso } = require('../models/Usuario');
const { normalizeEmail, pickDefined } = require('../utils/validation');

// Shared by POST /entrenadores/register and POST /auth/register/entrenador.
// Returns the new coach, or null when the email is already used.
const crearEntrenadorDelClub = async (club_id, { nombre, correo, password, equipo }) => {
  const correoNormalitzat = normalizeEmail(correo);
  if (await correoEnUso(correoNormalitzat)) return null;

  const passwordHash = await bcrypt.hash(password, 10);
  return Entrenador.crearEntrenador({ nombre: nombre.trim(), correo: correoNormalitzat, passwordHash, equipo, club_id });
};

// A club can access its own coaches; a coach can access only their own profile.
const cargarEntrenadorAccesible = async (user, entrenador_id) => {
  const entrenador = await Entrenador.buscarEntrenadorPorId(entrenador_id);
  if (!entrenador) return null;
  if (user.tipo === 'club' && entrenador.club_id === user.id) return entrenador;
  if (user.tipo === 'entrenador' && entrenador.entrenador_id === user.id) return entrenador;
  return null;
};

// POST /entrenadores/register (club)
const registrarEntrenador = async (req, res) => {
  const entrenador = await crearEntrenadorDelClub(req.user.id, req.body);
  if (!entrenador) return res.status(409).json({ error: 'Ja existeix un compte amb aquest correu.' });
  return res.status(201).json({ message: 'Entrenador creat correctament', entrenador });
};

// GET /entrenadores (club): coaches of the authenticated club.
const listarEntrenadores = async (req, res) => {
  res.json(await Entrenador.obtenerEntrenadoresDelClub(req.user.id));
};

// GET /entrenadores/:id
const obtenerEntrenadorPorId = async (req, res) => {
  const entrenador = await cargarEntrenadorAccesible(req.user, Number(req.params.id));
  if (!entrenador) return res.status(404).json({ error: 'Entrenador no trobat' });
  return res.json(entrenador);
};

// PUT /entrenadores/:id: a club edits its coaches, a coach edits their own profile.
// Partial update: fields that are not sent are left untouched.
const editarEntrenador = async (req, res) => {
  const entrenador_id = Number(req.params.id);
  const entrenador = await cargarEntrenadorAccesible(req.user, entrenador_id);
  if (!entrenador) return res.status(404).json({ error: 'Entrenador no trobat' });

  const campos = pickDefined(
    req.body,
    Entrenador.EDITABLE_COLUMNS.filter((column) => column !== 'password')
  );
  if (campos.nombre) campos.nombre = campos.nombre.trim();
  if (campos.correo) {
    campos.correo = normalizeEmail(campos.correo);
    if (await correoEnUso(campos.correo, { exceptEntrenadorId: entrenador_id })) {
      return res.status(409).json({ error: 'Ja existeix un compte amb aquest correu.' });
    }
  }
  if (req.body.password) campos.password = await bcrypt.hash(req.body.password, 10);

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No hi ha cap camp per actualitzar.' });
  }

  await Entrenador.actualizarEntrenador(entrenador_id, campos);
  return res.json({ message: 'Entrenador actualitzat correctament' });
};

// DELETE /entrenadores/:id (club)
const eliminarEntrenador = async (req, res) => {
  const deleted = await Entrenador.eliminarEntrenadorPorId(Number(req.params.id), req.user.id);
  if (!deleted) return res.status(404).json({ error: 'Entrenador no trobat' });
  return res.json({ message: 'Entrenador eliminat correctament' });
};

// GET /entrenadores/me (coach)
const obtenerMiPerfilEntrenador = async (req, res) => {
  const entrenador = await Entrenador.buscarEntrenadorPorId(req.user.id);
  if (!entrenador) return res.status(404).json({ error: 'Entrenador no trobat' });
  return res.json(entrenador);
};

module.exports = {
  crearEntrenadorDelClub,
  registrarEntrenador,
  listarEntrenadores,
  obtenerEntrenadorPorId,
  editarEntrenador,
  eliminarEntrenador,
  obtenerMiPerfilEntrenador,
};
