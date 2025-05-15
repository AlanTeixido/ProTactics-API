const bcrypt = require('bcryptjs');
const {
  crearEntrenador,
  buscarPorCorreo,
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

// Obtener entrenadores del club autenticado
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
// Obtener un entrenador por ID
const obtenerEntrenadorPorId = async (req, res) => {
  const { id } = req.params;
  const club_id = req.user.id;

  try {
    const result = await db.query(
      'SELECT * FROM entrenadores WHERE entrenador_id = $1 AND club_id = $2',
      [id, club_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error obteniendo entrenador:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};


// Eliminar entrenador
const eliminarEntrenador = async (req, res) => {
  const club_id = req.user.id;
  const { id } = req.params;

  try {
    await eliminarEntrenadorPorId(id, club_id);
    res.json({ message: 'Entrenador eliminat correctament' });
  } catch (error) {
    console.error("❌ Error eliminant entrenador:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// Editar entrenador
const editarEntrenador = async (req, res) => {
  const club_id = req.user.id;
  const entrenador_id = req.params.id;
  const { nombre, correo, password, telefono, foto_url, notas } = req.body;

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    await actualizarEntrenador(entrenador_id, nombre, correo, hashedPassword, telefono, foto_url, notas, club_id);
    res.json({ message: 'Entrenador actualizado correctamente' });
  } catch (error) {
    console.error("❌ Error actualizando entrenador:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};


module.exports = {
  registrarEntrenador,
  listarEntrenadores,
  eliminarEntrenador,
  editarEntrenador,
  obtenerEntrenadorPorId
};
