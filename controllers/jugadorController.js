const { Readable } = require('stream');
const csv = require('csv-parser');
const Equipo = require('../models/Equipo');
const Jugador = require('../models/Jugador');
const { pickDefined, parseId, toInt } = require('../utils/validation');

const MAX_CSV_ROWS = 1000;

// The team must belong to the coach's club.
const equipoDelMeuClub = (equipo_id, user) => Equipo.buscarEquipoDelClub(equipo_id, user.club_id);

// POST /jugadores/register (coach)
const registrarJugador = async (req, res) => {
  const { nombre, apellido, dorsal, posicion, equipo_id } = req.body;
  const entrenador_id = req.user.id;

  if (!(await equipoDelMeuClub(equipo_id, req.user))) {
    return res.status(404).json({ error: 'Equip no trobat.' });
  }
  if (await Jugador.buscarJugadorPorDorsal(dorsal, entrenador_id)) {
    return res.status(409).json({ error: 'Ja existeix un jugador amb aquest dorsal.' });
  }

  const nuevoJugador = await Jugador.crearJugador(
    nombre.trim(),
    apellido.trim(),
    dorsal,
    posicion.trim(),
    entrenador_id,
    equipo_id
  );
  return res.status(201).json({ message: 'Jugador creat correctament', jugador: nuevoJugador });
};

// GET /jugadores: a coach gets their players, a club gets the players of its teams.
const obtenerJugadoresPorEntrenador = async (req, res) => {
  const { id, tipo } = req.user;
  const jugadores =
    tipo === 'club' ? await Jugador.obtenerJugadoresDelClub(id) : await Jugador.obtenerJugadoresDelEntrenador(id);
  res.json(jugadores);
};

// GET /jugadores/:id
const obtenerJugadorPorId = async (req, res) => {
  const id = Number(req.params.id);
  const jugador =
    req.user.tipo === 'club'
      ? await Jugador.obtenerJugadorDelClub(id, req.user.id)
      : await Jugador.obtenerJugadorPorIdDB(id, req.user.id);
  if (!jugador) return res.status(404).json({ error: 'Jugador no trobat' });
  return res.json(jugador);
};

// PUT /jugadores/:id (coach, own players only). Partial update.
const actualizarJugador = async (req, res) => {
  const id = Number(req.params.id);
  const entrenador_id = req.user.id;
  const campos = pickDefined(req.body, Jugador.EDITABLE_COLUMNS);

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No hi ha cap camp per actualitzar.' });
  }
  if (!(await Jugador.obtenerJugadorPorIdDB(id, entrenador_id))) {
    return res.status(404).json({ error: 'Jugador no trobat' });
  }
  if (campos.equipo_id !== undefined && !(await equipoDelMeuClub(campos.equipo_id, req.user))) {
    return res.status(404).json({ error: 'Equip no trobat.' });
  }
  if (campos.dorsal !== undefined) {
    const mateixDorsal = await Jugador.buscarJugadorPorDorsal(campos.dorsal, entrenador_id);
    if (mateixDorsal && mateixDorsal.jugador_id !== id) {
      return res.status(409).json({ error: 'Ja existeix un altre jugador amb aquest dorsal.' });
    }
  }
  for (const key of ['nombre', 'apellido', 'posicion']) {
    if (typeof campos[key] === 'string') campos[key] = campos[key].trim();
  }

  await Jugador.actualizarJugadorDB(id, entrenador_id, campos);
  return res.json({ message: 'Jugador actualitzat correctament' });
};

// DELETE /jugadores/:id (coach, own players only)
const eliminarJugador = async (req, res) => {
  const deleted = await Jugador.eliminarJugadorPorId(Number(req.params.id), req.user.id);
  if (!deleted) return res.status(404).json({ error: 'Jugador no trobat' });
  return res.json({ message: 'Jugador eliminat correctament' });
};

// GET /jugadores/equipo/:equipo_id: only teams of the user's club.
const obtenerJugadoresPorEquipoController = async (req, res) => {
  const equipo_id = Number(req.params.equipo_id);
  const club_id = req.user.tipo === 'club' ? req.user.id : req.user.club_id;

  if (!(await Equipo.buscarEquipoDelClub(equipo_id, club_id))) {
    return res.status(404).json({ error: 'Equip no trobat.' });
  }
  return res.json(await Jugador.obtenerJugadoresPorEquipo(equipo_id));
};

const llegirCsv = (buffer) =>
  new Promise((resolve, reject) => {
    const files = [];
    let massaFiles = false;
    Readable.from([buffer])
      .pipe(csv({ mapHeaders: ({ header }) => header.replace(/^﻿/, '').trim() }))
      .on('data', (row) => {
        if (files.length < MAX_CSV_ROWS) files.push(row);
        else massaFiles = true;
      })
      .on('end', () => resolve({ files, massaFiles }))
      .on('error', reject);
  });

const campCsv = (row, ...keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return String(row[key]).trim();
  }
  return '';
};

// POST /jugadores/upload-csv (coach). Columns: Nombre, Apellido, Dorsal, Posición and
// Categoria (or equipo_id). Invalid rows and teams outside the coach's club are skipped.
const subirJugadoresDesdeCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No s\'ha enviat cap arxiu.' });

  const { files, massaFiles } = await llegirCsv(req.file.buffer);
  if (massaFiles) {
    return res.status(400).json({ error: `L'arxiu té massa files (màxim ${MAX_CSV_ROWS}).` });
  }

  const entrenador_id = req.user.id;
  const club_id = req.user.club_id;
  const equipoPerCategoria = new Map();
  const equipoValid = new Map();
  let creados = 0;
  let duplicados = 0;

  for (const row of files) {
    const nombre = campCsv(row, 'nombre', 'Nombre');
    const apellido = campCsv(row, 'apellido', 'Apellido');
    const dorsal = toInt(campCsv(row, 'dorsal', 'Dorsal'));
    const posicion = campCsv(row, 'posicion', 'Posicion', 'Posición', 'posición');
    const categoria = campCsv(row, 'categoria', 'Categoria', 'Categoría', 'categoría');
    let equipo_id = parseId(campCsv(row, 'equipo_id'));

    if (!nombre || !apellido || !posicion) continue;
    if (nombre.length > 100 || apellido.length > 100 || posicion.length > 50) continue;
    if (!Number.isInteger(dorsal) || dorsal < 0 || dorsal > 99) continue;

    if (equipo_id) {
      if (!equipoValid.has(equipo_id)) {
        equipoValid.set(equipo_id, Boolean(await Equipo.buscarEquipoDelClub(equipo_id, club_id)));
      }
      if (!equipoValid.get(equipo_id)) continue;
    } else if (categoria) {
      const key = categoria.toLowerCase();
      if (!equipoPerCategoria.has(key)) {
        equipoPerCategoria.set(key, await Equipo.obtenerEquipoIdPorCategoria(categoria, club_id, entrenador_id));
      }
      equipo_id = equipoPerCategoria.get(key);
    }
    if (!equipo_id) continue;

    if (await Jugador.buscarJugadorPorDorsal(dorsal, entrenador_id)) {
      duplicados++;
      continue;
    }

    await Jugador.crearJugador(nombre, apellido, dorsal, posicion, entrenador_id, equipo_id);
    creados++;
  }

  return res.status(200).json({
    mensaje: 'CSV processat correctament',
    jugadors_creats: creados,
    duplicats: duplicados,
  });
};

module.exports = {
  registrarJugador,
  obtenerJugadoresPorEntrenador,
  eliminarJugador,
  obtenerJugadorPorId,
  actualizarJugador,
  obtenerJugadoresPorEquipoController,
  subirJugadoresDesdeCSV,
};
