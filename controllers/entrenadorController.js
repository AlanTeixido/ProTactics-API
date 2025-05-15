const bcrypt = require('bcryptjs');
const {
  crearEntrenador,
  buscarPorCorreo,
  buscarEntrenadorPorId,
  obtenerEntrenadoresDelClub,
  eliminarEntrenadorPorId,
  actualizarEntrenador
} = require('../models/Entrenador');

// Crear nuevo entrenador
const registrarEntrenador = async (req, res) => {
  const { nombre, correo, password, equipo } = req.body;
  const club_id = req.user.id;

  if (!nombre || !correo || !password || !equipo) {
    return res.status(400).json({ error: 'Falten camps obligatoris.' });
  }

  try {
    const existe = await buscarPorCorreo(correo);
    if (existe) {
      return res.status(409).json({ error: 'Ja existeix un entrenador amb aquest correu.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoEntrenador = await crearEntrenador(nombre, correo, hashedPassword, equipo, club_id);

    res.status(201).json({ message: 'Entrenador creat correctament', entrenador: nuevoEntrenador });
  } catch (error) {
    console.error("❌ Error creant entrenador:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// Obtener todos los entrenadores del club autenticado
const listarEntrenadores = async (req, res) => {
  const club_id = req.user.id;

  try {
    const entrenadores = await obtenerEntrenadoresDelClub(club_id);
    res.json(entrenadores);
  } catch (error) {
    console.error('❌ Error llistant entrenadors:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// Obtener perfil de un entrenador por ID (protegido y validado por club_id)
const obtenerEntrenadorPorId = async (req, res) => {
  const entrenador_id = req.params.id;
  const club_id = req.user.id;

  try {
    const entrenador = await buscarEntrenadorPorId(entrenador_id);

    if (!entrenador || entrenador.club_id !== club_id) {
      return res.status(404).json({ error: 'Entrenador no trobat' });
    }

    res.json(entrenador);
  } catch (error) {
    console.error("❌ Error obtenint entrenador:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// Editar entrenador
const editarEntrenador = async (req, res) => {
  const club_id = req.user.id;
  const entrenador_id = req.params.id;
  const { nombre, correo, password, equipo, telefono, foto_url, notas } = req.body;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    await actualizarEntrenador(entrenador_id, nombre, correo, hashedPassword, equipo, telefono, foto_url, notas, club_id);
    res.json({ message: 'Entrenador actualitzat correctament' });
  } catch (error) {
    console.error("❌ Error actualitzant entrenador:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// Eliminar entrenador
const eliminarEntrenador = async (req, res) => {
  const club_id = req.user.id;
  const entrenador_id = req.params.id;

  try {
    await eliminarEntrenadorPorId(entrenador_id, club_id);
    res.json({ message: 'Entrenador eliminat correctament' });
  } catch (error) {
    console.error("❌ Error eliminant entrenador:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  registrarEntrenador,
  listarEntrenadores,
  obtenerEntrenadorPorId,
  editarEntrenador,
  eliminarEntrenador
};
