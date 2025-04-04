const { crearEntrenamiento, relacionarJugadores, obtenerEntrenamientosPorEntrenador } = require('../models/Entrenamiento');

const crearEntrenamientoController = async (req, res) => {
  const entrenador_id = req.user.id;
  const {
      titulo, descripcion, categoria, campo, fecha_entrenamiento,
      duracion_repeticion, repeticiones, descanso,
      valoracion, imagen_url, notas, jugadores
  } = req.body;

  const nuevoEntrenamiento = await crearEntrenamiento(
      entrenador_id, titulo, descripcion, categoria, campo,
      fecha_entrenamiento, duracion_repeticion, repeticiones,
      descanso, valoracion, imagen_url, notas
  );

  if (jugadores && jugadores.length > 0) {
      await relacionarJugadores(nuevoEntrenamiento.entrenamiento_id, jugadores);
  }

  res.status(201).json({ message: 'Entrenamiento creado', entrenamiento: nuevoEntrenamiento });
};

const obtenerEntrenamientos = async (req, res) => {
  const entrenador_id = req.user.id;

  try {
    const entrenamientos = await obtenerEntrenamientosPorEntrenador(entrenador_id);
    res.status(200).json(entrenamientos);
  } catch (error) {
    console.error('Error obteniendo los entrenamientos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = {
  crearEntrenamientoController,
  obtenerEntrenamientos
};
