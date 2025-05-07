const {
  crearClub,
  buscarPorCorreo,
  obtenerTodosLosClubs,
  obtenerClubPorIdDB,
  actualizarClub
} = require('../models/Club');

// Crear nuevo club
const registrarClub = async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Falten dades obligatòries.' });
  }

  try {
    const existe = await buscarPorCorreo(correo);
    if (existe) {
      return res.status(409).json({ error: 'Ja existeix un club amb aquest correu.' });
    }

    const nuevoClub = await crearClub(nombre, correo, password);
    res.status(201).json({ message: 'Club creat correctament', club: nuevoClub });
  } catch (error) {
    console.error("❌ Error creant club:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// Obtener todos los clubs
const obtenerClubs = async (_req, res) => {
  try {
    const clubs = await obtenerTodosLosClubs();
    res.status(200).json(clubs);
  } catch (error) {
    console.error("❌ Error obtenint clubs:", error);
    res.status(500).json({ error: 'Error al recuperar els clubs' });
  }
};

// Obtener un club por ID
const obtenerClubPorId = async (req, res) => {
  const club_id = req.params.id;

  try {
    const club = await obtenerClubPorIdDB(club_id);
    if (!club) {
      return res.status(404).json({ error: 'Club no trobat.' });
    }
    res.status(200).json(club);
  } catch (error) {
    console.error("❌ Error obtenint club:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// Editar un club
const editarClub = async (req, res) => {
  const club_id = req.params.id;
  const { nombre, correo, ubicacion } = req.body;

  try {
    await actualizarClub(club_id, nombre, correo, ubicacion);
    res.status(200).json({ message: 'Club actualitzat correctament.' });
  } catch (error) {
    console.error("❌ Error actualitzant club:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  registrarClub,
  obtenerClubs,
  obtenerClubPorId,
  editarClub
};
