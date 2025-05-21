const {
  crearEquipo,
  obtenerEquiposDelClub,
  obtenerEquiposDelEntrenador,
  actualizarEquipoDB,
  eliminarEquipoDB
} = require('../models/Equipo');

const crearEquipoController = async (req, res) => {
  const { nombre, categoria, entrenador_id } = req.body;
  const { id, tipo } = req.user; // id = club_id

  if (tipo !== 'club') {
    return res.status(403).json({ error: 'No tens permís per crear equips.' });
  }

  if (!nombre || !categoria || !entrenador_id) {
    return res.status(400).json({ error: 'Falten camps obligatoris.' });
  }

  try {
    const nuevoEquipo = await crearEquipo(nombre, categoria, entrenador_id, id); // ara sí amb els 4 paràmetres
    res.status(201).json({ message: 'Equip creat correctament', equipo: nuevoEquipo });
  } catch (error) {
    console.error('❌ Error creant equip:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const obtenerEquipos = async (req, res) => {
  const { id } = req.user;

  try {
    const equipos = await obtenerEquiposDelClub(id);
    res.json(equipos);
  } catch (error) {
    console.error('❌ Error obtenint equips:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const obtenerEquiposPorEntrenador = async (req, res) => {
  const entrenador_id = req.user.id;

  try {
    const equipos = await obtenerEquiposDelEntrenador(entrenador_id);
    res.json(equipos);
  } catch (error) {
    console.error('❌ Error obtenint equips per entrenador:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const editarEquipo = async (req, res) => {
  const { id, tipo } = req.user;
  const equipo_id = req.params.id;
  const { nombre, categoria } = req.body;

  if (tipo !== 'club') {
    return res.status(403).json({ error: 'No tens permís per editar equips.' });
  }

  try {
    await actualizarEquipoDB(equipo_id, id, nombre, categoria);
    res.json({ message: 'Equip actualitzat correctament' });
  } catch (error) {
    console.error('❌ Error actualitzant equip:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const eliminarEquipo = async (req, res) => {
  const { id, tipo } = req.user;
  const equipo_id = req.params.id;

  if (tipo !== 'club') {
    return res.status(403).json({ error: 'No tens permís per eliminar equips.' });
  }

  try {
    await eliminarEquipoDB(equipo_id, id);
    res.json({ message: 'Equip eliminat correctament' });
  } catch (error) {
    console.error('❌ Error eliminant equip:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  crearEquipoController,
  obtenerEquipos,
  obtenerEquiposPorEntrenador,
  editarEquipo,
  eliminarEquipo
};
