const { obtenerResumenUsuario } = require('../models/Usuario');

const getResumen = async (req, res) => {
  const { id } = req.params;
  const rol = req.query.rol;

  try {
    const resumen = await obtenerResumenUsuario(id, rol);
    if (!resumen) {
      return res.status(404).json({ error: "No se encontró resumen para este rol." });
    }

    res.json(resumen);
  } catch (error) {
    console.error("Error obtenint resum:", error);
    res.status(500).json({ error: "Error del servidor." });
  }
};

module.exports = { getResumen };
