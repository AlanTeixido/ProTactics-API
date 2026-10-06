const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const Club = require('../models/Club');
const Entrenador = require('../models/Entrenador');
const { crearNouClub } = require('./clubController');
const { crearEntrenadorDelClub } = require('./entrenadorController');

// Compared against when the email is unknown, so both failure paths cost the same
// and the response does not reveal whether an account exists.
const DUMMY_HASH = bcrypt.hashSync('protactics-timing-equalizer', 10);
const LOGIN_ERROR = 'Correu o contrasenya incorrectes.';

const firmarToken = (payload) => jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn, algorithm: 'HS256' });

// POST /auth/register/club (public)
const registrarClub = async (req, res) => {
  const club = await crearNouClub(req.body);
  if (!club) return res.status(409).json({ error: 'El correu ja està registrat.' });
  return res.status(201).json({
    message: '✅ Club registrat!',
    club: { club_id: club.club_id, nombre: club.nombre, correo: club.correo },
  });
};

// POST /auth/register/entrenador (authenticated club; the coach joins that club)
const registrarEntrenador = async (req, res) => {
  const entrenador = await crearEntrenadorDelClub(req.user.id, req.body);
  if (!entrenador) return res.status(409).json({ error: 'El correu ja està registrat.' });
  return res.status(201).json({
    message: '✅ Entrenador registrat!',
    entrenador: { entrenador_id: entrenador.entrenador_id, nombre: entrenador.nombre, correo: entrenador.correo },
  });
};

// POST /auth/login: single endpoint for clubs and coaches.
const login = async (req, res) => {
  const correo = req.body.correo.trim();
  const { password } = req.body;

  const club = await Club.buscarCredencialesPorCorreo(correo);
  const entrenador = club ? null : await Entrenador.buscarCredencialesPorCorreo(correo);
  const cuenta = club || entrenador;

  const passwordOk = await bcrypt.compare(password, cuenta ? cuenta.password : DUMMY_HASH);
  if (!cuenta || !passwordOk) {
    return res.status(401).json({ error: LOGIN_ERROR });
  }

  if (club) {
    const token = firmarToken({ id: club.club_id, tipo: 'club', correo: club.correo });
    return res.json({ message: 'Login club correcte', token, rol: 'club', id: club.club_id, nombre: club.nombre });
  }

  const token = firmarToken({ id: entrenador.entrenador_id, tipo: 'entrenador', correo: entrenador.correo });
  return res.json({
    message: 'Login entrenador correcte',
    token,
    rol: 'entrenador',
    id: entrenador.entrenador_id,
    nombre: entrenador.nombre,
  });
};

module.exports = {
  registrarClub,
  registrarEntrenador,
  login,
};
