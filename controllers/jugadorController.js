const {
  crearJugador,
  buscarJugadorPorDorsal,
  obtenerJugadoresDelEntrenador
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

    res.status(201).json({
      message: 'Jugador creado correctamente',
      jugador: nuevoJugador
    });
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

module.exports = {
  registrarJugador,
  obtenerJugadoresPorEntrenador
};
