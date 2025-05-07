const {
  crearClub,
  buscarPorCorreo,
  buscarClubPorId,
  actualizarPerfilClub,
  actualizarPasswordClub,
} = require('../models/Club');

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

const obtenerClubPorId = async (req, res) => {
  const id = req.params.id;
  try {
    const club = await buscarClubPorId(id);
    if (!club) return res.status(404).json({ error: 'Club no trobat.' });
    res.status(200).json(club);
  } catch (error) {
    console.error('❌ Error obtenint club:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const editarPerfilClub = async (req, res) => {
  const id = req.params.id;
  const { nombre, correo, ubicacion, foto_url } = req.body;

  if (!nombre || !correo) {
    return res.status(400).json({ error: 'Nom i correu són obligatoris.' });
  }

  try {
    await actualizarPerfilClub(id, { nombre, correo, ubicacion, foto_url });
    res.status(200).json({ message: 'Perfil actualitzat correctament' });
  } catch (error) {
    console.error('❌ Error actualitzant perfil:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const editarPasswordClub = async (req, res) => {
  const id = req.params.id;
  const { contrasena_actual, contrasena_nova } = req.body;

  if (!contrasena_actual || !contrasena_nova) {
    return res.status(400).json({ error: 'Falten camps obligatoris.' });
  }

  try {
    const canviada = await actualizarPasswordClub(id, contrasena_actual, contrasena_nova);
    if (!canviada) {
      return res.status(401).json({ error: 'Contrasenya actual incorrecta.' });
    }
    res.status(200).json({ message: 'Contrasenya actualitzada correctament' });
  } catch (error) {
    console.error('❌ Error canviant contrasenya:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  registrarClub,
  obtenerClubPorId,
  editarPerfilClub,
  editarPasswordClub
};
