const {
  crearEntrenamiento,
  editarEntrenamiento,
  eliminarEntrenamiento,
  obtenerEntrenamientosPorEntrenador,
  relacionarJugadores // 🔥 Aquí ara sí que l’importem
} = require('../models/Entrenamiento');

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

const editarEntrenamientoController = async (req, res) => {
  const entrenador_id = req.user.id;
  const entrenamiento_id = req.params.id;
  const {
    titulo, descripcion, categoria, campo, fecha_entrenamiento,
    duracion_repeticion, repeticiones, descanso,
    valoracion, imagen_url, notas
  } = req.body;

  await editarEntrenamiento(
    entrenamiento_id, entrenador_id, {
      titulo, descripcion, categoria, campo, fecha_entrenamiento,
      duracion_repeticion, repeticiones, descanso,
      valoracion, imagen_url, notas
    }
  );

  res.status(200).json({ message: 'Entrenamiento actualizado correctamente' });
};

const eliminarEntrenamientoController = async (req, res) => {
  const entrenador_id = req.user.id;
  const entrenamiento_id = req.params.id;

  await eliminarEntrenamiento(entrenamiento_id, entrenador_id);

  res.status(200).json({ message: 'Entrenamiento eliminado correctamente' });
};

const obtenerEntrenamientosController = async (req, res) => {
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
  editarEntrenamientoController,
  eliminarEntrenamientoController,
  obtenerEntrenamientosController
};
