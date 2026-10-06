const bcrypt = require('bcryptjs');
const Club = require('../models/Club');
const { correoEnUso } = require('../models/Usuario');
const { normalizeEmail } = require('../utils/validation');

// Shared by POST /clubes/register and POST /auth/register/club.
// Returns the new club profile, or null when the email is already used.
const crearNouClub = async ({ nombre, correo, password, ubicacion }) => {
  const correoNormalitzat = normalizeEmail(correo);
  if (await correoEnUso(correoNormalitzat)) return null;

  const passwordHash = await bcrypt.hash(password, 10);
  return Club.crearClub({ nombre: nombre.trim(), correo: correoNormalitzat, passwordHash, ubicacion });
};

const esElMateixClub = (user, clubId) => user.tipo === 'club' && user.id === clubId;
const potVeureClub = (user, clubId) =>
  esElMateixClub(user, clubId) || (user.tipo === 'entrenador' && user.club_id === clubId);

// POST /clubes/register (public)
const registrarClub = async (req, res) => {
  const club = await crearNouClub(req.body);
  if (!club) return res.status(409).json({ error: 'Ja existeix un compte amb aquest correu.' });
  return res.status(201).json({ message: 'Club creat correctament', club });
};

// GET /clubes (public): no emails, no password hashes.
const listarClubs = async (req, res) => {
  res.status(200).json(await Club.listarClubs());
};

// GET /clubes/:id: the club itself or one of its coaches.
const obtenerClubPorId = async (req, res) => {
  const id = Number(req.params.id);
  if (!potVeureClub(req.user, id)) {
    return res.status(403).json({ error: 'No tens permís per veure aquest club.' });
  }

  const club = await Club.buscarClubPorId(id);
  if (!club) return res.status(404).json({ error: 'Club no trobat.' });
  return res.status(200).json(club);
};

// PUT /clubes/:id: only the club itself.
const editarPerfilClub = async (req, res) => {
  const id = Number(req.params.id);
  if (!esElMateixClub(req.user, id)) {
    return res.status(403).json({ error: 'Només pots editar el teu propi perfil.' });
  }

  const { nombre, ubicacion, foto_url } = req.body;
  const correo = normalizeEmail(req.body.correo);
  if (await correoEnUso(correo, { exceptClubId: id })) {
    return res.status(409).json({ error: 'Ja existeix un compte amb aquest correu.' });
  }

  const updated = await Club.actualizarPerfilClub(id, { nombre: nombre.trim(), correo, ubicacion, foto_url });
  if (!updated) return res.status(404).json({ error: 'Club no trobat.' });
  return res.status(200).json({ message: 'Perfil actualitzat correctament' });
};

// PUT /clubes/:id/password: only the club itself, with its current password.
const editarPasswordClub = async (req, res) => {
  const id = Number(req.params.id);
  if (!esElMateixClub(req.user, id)) {
    return res.status(403).json({ error: 'Només pots canviar la teva pròpia contrasenya.' });
  }

  const { contrasena_actual, contrasena_nova } = req.body;
  const hashActual = await Club.obtenerPasswordHash(id);
  if (!hashActual) return res.status(404).json({ error: 'Club no trobat.' });

  if (!(await bcrypt.compare(contrasena_actual, hashActual))) {
    return res.status(401).json({ error: 'Contrasenya actual incorrecta.' });
  }

  await Club.actualizarPasswordClub(id, await bcrypt.hash(contrasena_nova, 10));
  return res.status(200).json({ message: 'Contrasenya actualitzada correctament' });
};

module.exports = {
  crearNouClub,
  registrarClub,
  listarClubs,
  obtenerClubPorId,
  editarPerfilClub,
  editarPasswordClub,
};
