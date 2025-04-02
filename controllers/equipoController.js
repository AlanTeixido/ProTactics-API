const {
    crearEquipo,
    obtenerEquiposDelClub,
    actualizarEquipoDB,
    eliminarEquipoDB
  } = require('../models/Equipo');
  
  const crearEquipoController = async (req, res) => {
    const { nombre, categoria } = req.body;
    const { id, rol } = req.user;
  
    if (rol !== 'club') {
      return res.status(403).json({ error: 'No tens permís per crear equips.' });
    }
  
    if (!nombre || !categoria) {
      return res.status(400).json({ error: 'Falten camps obligatoris.' });
    }
  
    try {
      const nuevoEquipo = await crearEquipo(nombre, categoria, id);
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
  
  const editarEquipo = async (req, res) => {
    const { id, rol } = req.user;
    const equipo_id = req.params.id;
    const { nombre, categoria } = req.body;
  
    if (rol !== 'club') {
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
    const { id, rol } = req.user;
    const equipo_id = req.params.id;
  
    if (rol !== 'club') {
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
    editarEquipo,
    eliminarEquipo
  };
  