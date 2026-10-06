const { obtenerResumenUsuario } = require('../models/Usuario');
const { buscarEntrenadorPorId } = require('../models/Entrenador');

// Own summary, or (for a club) the summary of one of its coaches.
const potVeureResum = async (user, id, rol) => {
  if (rol === user.tipo && id === user.id) return true;
  if (user.tipo === 'club' && rol === 'entrenador') {
    const entrenador = await buscarEntrenadorPorId(id);
    return Boolean(entrenador && entrenador.club_id === user.id);
  }
  return false;
};

// GET /usuarios/:id/resumen?rol=club|entrenador
const getResumen = async (req, res) => {
  const id = Number(req.params.id);
  const { rol } = req.query;

  if (rol !== 'club' && rol !== 'entrenador') {
    return res.status(404).json({ error: 'No se encontró resumen para este rol.' });
  }
  if (!(await potVeureResum(req.user, id, rol))) {
    return res.status(403).json({ error: 'No tens permís per veure aquest resum.' });
  }

  const resumen = await obtenerResumenUsuario(id, rol);
  if (!resumen) return res.status(404).json({ error: 'No se encontró resumen para este rol.' });
  return res.json(resumen);
};

module.exports = { getResumen };
