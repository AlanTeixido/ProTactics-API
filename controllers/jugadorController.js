const fs = require('fs');
const csv = require('csv-parser');
const db = require('../requests/db'); 
const { obtenerEquipoIdPorNombre } = require('../models/Equipo');


const {
  crearJugador,
  buscarJugadorPorDorsal,
  obtenerJugadoresDelEntrenador,
  eliminarJugadorPorId,
  obtenerJugadorPorIdDB,
  actualizarJugadorDB,
  obtenerJugadoresPorEquipo
} = require('../models/Jugador');

const registrarJugador = async (req, res) => {
  const { nombre, apellido, dorsal, posicion, equipo_id } = req.body;
  const entrenador_id = req.user.id;

  if (!nombre || !apellido || !dorsal || !posicion || !equipo_id) {
    return res.status(400).json({ error: 'Tots els camps són obligatoris, inclòs l\'equip.' });
  }

  try {
    const existe = await buscarJugadorPorDorsal(dorsal, entrenador_id);
    if (existe) {
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
    const jugadorConMismoDorsal = await buscarJugadorPorDorsal(dorsal, entrenador_id);
    if (jugadorConMismoDorsal && jugadorConMismoDorsal.jugador_id != id) {
      return res.status(409).json({ error: 'Ja existeix un altre jugador amb aquest dorsal.' });
    }

    await actualizarJugadorDB(nombre, apellido, posicion, dorsal, equipo_id, id, entrenador_id);
    res.json({ message: 'Jugador actualitzat correctament' });
  } catch (error) {
    console.error('❌ Error actualitzant jugador:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

const obtenerJugadoresPorEquipoController = async (req, res) => {
  const equipo_id = req.params.equipo_id;

  try {
    const jugadores = await obtenerJugadoresPorEquipo(equipo_id);
    res.json(jugadores);
  } catch (error) {
    console.error('❌ Error obtenint jugadors per equip:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};



// Controlador para subir los jugadores desde un archivo CSV
const subirJugadoresDesdeCSV = async (req, res) => {
  const entrenador_id = req.user.id;
  const filePath = req.file?.path;

  if (!filePath) return res.status(400).json({ error: 'No s\'ha enviat cap arxiu.' });

  const jugadores = [];
  let creados = 0;
  let duplicados = 0;

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => jugadores.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of jugadores) {
      // Normalización de campos (mayúsculas/minúsculas y espacios)
      const nombre = row.nombre || row.Nombre || '';
      const apellido = row.apellido || row.Apellido || '';
      const dorsal = row.dorsal || row.Dorsal || '';
      const posicion = row.posicion || row.Posición || row.posición || '';
      const equipoNombre = row.equipo || row.Equipo || ''; // nombre del equipo en texto
      let equipo_id = row.equipo_id || ''; // puede venir directamente también

      // Buscar equipo_id si solo se pasó el nombre
      if (!equipo_id && equipoNombre) {
        equipo_id = await obtenerEquipoIdPorNombre(equipoNombre, entrenador_id);
      }

      if (!nombre || !apellido || !dorsal || !posicion || !equipo_id) continue;

      const existe = await buscarJugadorPorDorsal(dorsal, entrenador_id);
      if (existe) {
        duplicados++;
        continue;
      }

      await crearJugador(nombre.trim(), apellido.trim(), dorsal.trim(), posicion.trim(), entrenador_id, equipo_id);
      creados++;
    }

    fs.unlinkSync(filePath); // Eliminar archivo temporal

    res.status(200).json({
      mensaje: 'CSV processat correctament',
      jugadors_creats: creados,
      duplicats: duplicados
    });

  } catch (err) {
    console.error('❌ Error llegint CSV:', err);
    res.status(500).json({ error: 'Error processant l\'arxiu CSV.' });
  }
};

module.exports = {
  registrarJugador,
  obtenerJugadoresPorEntrenador,
  eliminarJugador,
  obtenerJugadorPorId,
  actualizarJugador,
  obtenerJugadoresPorEquipoController,
  subirJugadoresDesdeCSV
};
