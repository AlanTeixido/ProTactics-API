const {
  crearJugador,
  buscarJugadorPorDorsal,
  obtenerJugadoresDelEntrenador,
  eliminarJugadorPorId,
  obtenerJugadorPorIdDB,
  actualizarJugadorDB
} = require('../models/Jugador');

const registrarJugador = async (req, res) => {
  const { nombre, apellido, dorsal, posicion } = req.body;
  const entrenador_id = req.user.id;

  if (!nombre || !apellido || !dorsal || !posicion) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const existe = await buscarJugadorPorDorsal(dorsal);
    if (existe) {
      return res.status(409).json({ error: 'Ya existe un jugador con ese dorsal.' });
    }

    const nuevoJugador = await crearJugador(nombre, apellido, dorsal, posicion, entrenador_id);
    res.status(201).json({ message: 'Jugador creado correctamente', jugador: nuevoJugador });
  } catch (error) {
    console.error('❌ Error creando jugador:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const obtenerJugadoresPorEntrenador = async (req, res) => {
  const entrenador_id = req.user.id;

  try {
    const jugadores = await obtenerJugadoresDelEntrenador(entrenador_id);
    res.json(jugadores);
  } catch (error) {
    console.error('❌ Error obteniendo jugadores:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const eliminarJugador = async (req, res) => {
  const { id } = req.params;
  const entrenador_id = req.user.id;

  try {
    await eliminarJugadorPorId(id, entrenador_id);
    res.json({ message: 'Jugador eliminat correctament' });
  } catch (error) {
    console.error('❌ Error eliminant jugador:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const obtenerJugadorPorId = async (req, res) => {
  const { id } = req.params;
  const entrenador_id = req.user.id;

  try {
    const jugador = await obtenerJugadorPorIdDB(id, entrenador_id);
    if (!jugador) return res.status(404).json({ error: 'Jugador no trobat' });
    res.json(jugador);
  } catch (error) {
    console.error('❌ Error obtenint jugador per ID:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const actualizarJugador = async (req, res) => {
  const { id } = req.params;
  const entrenador_id = req.user.id;
  const { nombre, apellido, posicion, dorsal } = req.body;

  try {
    await actualizarJugadorDB(nombre, apellido, posicion, dorsal, id, entrenador_id);
    res.json({ message: 'Jugador actualitzat correctament' });
  } catch (error) {
    console.error('❌ Error actualitzant jugador:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  registrarJugador,
  obtenerJugadoresPorEntrenador,
  eliminarJugador,
  obtenerJugadorPorId,
  actualizarJugador
};
