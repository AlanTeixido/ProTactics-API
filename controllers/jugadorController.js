const {
  crearJugador,
  buscarJugadorPorDorsal,
  obtenerJugadoresDelEntrenador,
  eliminarJugadorPorId,
  obtenerJugadorPorIdDB,
  actualizarJugadorDB
} = require('../models/Jugador');

const registrarJugador = async (req, res) => {
  const { nombre, apellido, dorsal, posicion, equipo_id } = req.body;
  const entrenador_id = req.user.id;

  if (!nombre || !apellido || !dorsal || !posicion || !equipo_id) {
    return res.status(400).json({ error: 'Tots els camps són obligatoris, inclòs l\'equip.' });
  }

  try {
    const existe = await buscarJugadorPorDorsal(dorsal);
    if (existe && existe.entrenador_id === entrenador_id) {
      return res.status(409).json({ error: 'Ja existeix un jugador amb aquest dorsal.' });
    }

    const nuevoJugador = await crearJugador(nombre, apellido, dorsal, posicion, entrenador_id, equipo_id);
    res.status(201).json({ message: 'Jugador creat correctament', jugador: nuevoJugador });
  } catch (error) {
    console.error('❌ Error creant jugador:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const obtenerJugadoresPorEntrenador = async (req, res) => {
  const entrenador_id = req.user.id;

  try {
    const jugadores = await obtenerJugadoresDelEntrenador(entrenador_id);
    res.json(jugadores);
  } catch (error) {
    console.error('❌ Error obtenint jugadors:', error);
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
  const { nombre, apellido, posicion, dorsal, equipo_id } = req.body;

  try {
    const jugadorConMismoDorsal = await buscarJugadorPorDorsal(dorsal);
    if (jugadorConMismoDorsal && jugadorConMismoDorsal.jugador_id != id && jugadorConMismoDorsal.entrenador_id === entrenador_id) {
      return res.status(409).json({ error: 'Ja existeix un altre jugador amb aquest dorsal.' });
    }

    await actualizarJugadorDB(nombre, apellido, posicion, dorsal, equipo_id, id, entrenador_id);
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
