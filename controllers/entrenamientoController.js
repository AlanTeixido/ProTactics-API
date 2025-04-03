const {
    crearEntrenamiento,
    relacionarJugadores,
    obtenerEntrenamientosPorEntrenador,
    obtenerEntrenamientoPorId,
    obtenerJugadoresDelEntrenamiento,
    actualizarEntrenamiento,
    eliminarEntrenamiento
  } = require('../models/Entrenamiento');
  
  const crearEntrenamientoController = async (req, res) => {
    console.log('📥 Dades rebudes:', req.body); // Veure les dades rebudes
  
    const entrenador_id = req.user.id;
    const {
      titulo, descripcion, categoria, campo, fecha_entrenamiento,
      duracion_repeticion, repeticiones, descanso,
      valoracion, imagen_url, notas, jugadores
    } = req.body;
  
    try {
      const nuevo = await crearEntrenamiento(
        entrenador_id, titulo, descripcion, categoria, campo,
        fecha_entrenamiento, duracion_repeticion, repeticiones,
        descanso, valoracion, imagen_url, notas
      );
  
      if (jugadores && jugadores.length > 0) {
        await relacionarJugadores(nuevo.entrenamiento_id, jugadores);
      }
  
      res.status(201).json({ message: 'Entrenamiento creado', entrenamiento: nuevo });
    } catch (error) {
      console.error('❌ Error creando entrenamiento:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  };
  
  
  
  const listarEntrenamientos = async (req, res) => {
    try {
      const lista = await obtenerEntrenamientosPorEntrenador(req.user.id);
      res.json(lista);
    } catch (error) {
      console.error('❌ Error listando entrenamientos:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  };
  
  const obtenerEntrenamiento = async (req, res) => {
    try {
      const entrenamiento = await obtenerEntrenamientoPorId(req.params.id);
      const jugadores = await obtenerJugadoresDelEntrenamiento(req.params.id);
      res.json({ ...entrenamiento, jugadores });
    } catch (error) {
      console.error('❌ Error obteniendo entrenamiento:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  };
  
  const actualizarEntrenamientoController = async (req, res) => {
    try {
      await actualizarEntrenamiento(req.params.id, req.user.id, req.body);
      res.json({ message: 'Entrenamiento actualizado correctamente' });
    } catch (error) {
      console.error('❌ Error actualizando entrenamiento:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  };
  
  const eliminarEntrenamientoController = async (req, res) => {
    try {
      await eliminarEntrenamiento(req.params.id, req.user.id);
      res.json({ message: 'Entrenamiento eliminado correctamente' });
    } catch (error) {
      console.error('❌ Error eliminando entrenamiento:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  };
  
  module.exports = {
    crearEntrenamientoController,
    listarEntrenamientos,
    obtenerEntrenamiento,
    actualizarEntrenamientoController,
    eliminarEntrenamientoController
  };
  