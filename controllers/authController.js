import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Entrenador from '../models/Entrenador.js';
import Club from '../models/Club.js'; // Por si lo necesitas para login

// ⚽ REGISTRO DE CLUB
export const registerClub = async (req, res) => {
  const { nombre, correo, password } = req.body;

  try {
    const existingClub = await Club.findOne({ correo });
    if (existingClub) return res.status(400).json({ error: 'El club ya existe.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newClub = new Club({ nombre, correo, password: hashedPassword });
    await newClub.save();

    res.status(201).json({ message: 'Club registrado correctamente.' });
  } catch (err) {
    console.error('Error en registro de club:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 🧑‍🏫 REGISTRO DE ENTRENADOR
export const registerEntrenador = async (req, res) => {
  const { nombre, correo, password } = req.body;

  try {
    const existingEntrenador = await Entrenador.findOne({ correo });
    if (existingEntrenador) return res.status(400).json({ error: 'El entrenador ya existe.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newEntrenador = new Entrenador({ nombre, correo, password: hashedPassword });
    await newEntrenador.save();

    res.status(201).json({ message: 'Entrenador registrado correctamente.' });
  } catch (err) {
    console.error('Error en registro de entrenador:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 🔐 LOGIN (para club o entrenador)
export const login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    // Buscar en Club
    let user = await Club.findOne({ correo });
    let rol = 'club';

    // Si no existe, buscar en Entrenador
    if (!user) {
      user = await Entrenador.findOne({ correo });
      rol = 'entrenador';
    }

    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user._id, correo: user.correo, rol }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({
      token,
      id: user._id,
      correo: user.correo,
      nombre: user.nombre,
      rol
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
