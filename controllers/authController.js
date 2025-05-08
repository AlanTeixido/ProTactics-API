const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { buscarPorCorreo: buscarEntrenador, crearEntrenador } = require('../models/Entrenador');
const { buscarPorCorreo: buscarClub, crearClub } = require('../models/Club');

// 🔐 LOGIN para Club o Entrenadorconst login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    let user = await buscarClub(correo);
    let rol = 'club';

    if (!user) {
      user = await buscarEntrenador(correo);
      rol = 'entrenador';
    }

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta.' });

    const secretParaFirmar = "super_secret_key_1234"; // 👈 AÑADE ESTA LÍNEA

    const token = jwt.sign(
      { id: user.id, correo: user.correo, tipo: rol },
      secretParaFirmar, // 👈 USA secretParaFirmar AQUÍ
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      id: user.id,
      email: user.correo,
      nombre: user.nombre,
      rol,
    });

    console.log("🔑 [LOGIN] Token generado:", token);
    console.log("🔑 [LOGIN] JWT_SECRET usado (LITERAL):", secretParaFirmar); // 👈 AÑADE ESTA LÍNEA
    console.log("🔑 [LOGIN] JWT_SECRET desde env:", process.env.JWT_SECRET);

  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

// REGISTRO CLUB (usado solo si quieres unificar aquí)
const registerClub = async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password)
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });

  try {
    const existente = await buscarClub(correo);
    if (existente) return res.status(409).json({ error: 'El club ya está registrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoClub = await crearClub(nombre, correo, hashedPassword);

    res.status(201).json({
      message: 'Club registrado correctamente',
      club: nuevoClub,
    });
  } catch (err) {
    console.error('❌ Error en registro de club:', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// REGISTRO ENTRENADOR (usado solo si quieres unificar aquí)
const registerEntrenador = async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password)
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });

  try {
    const existente = await buscarEntrenador(correo);
    if (existente) return res.status(409).json({ error: 'El entrenador ya está registrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoEntrenador = await crearEntrenador(nombre, correo, hashedPassword);

    res.status(201).json({
      message: 'Entrenador registrado correctamente',
      entrenador: nuevoEntrenador,
    });
  } catch (err) {
    console.error('❌ Error en registro de entrenador:', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  login,
  registerClub,
  registerEntrenador,
};
