const { crearEntrenador, buscarPorCorreo } = require('../models/Entrenador');

const registrarEntrenador = async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Falten dades obligatòries.' });
  }

  try {
    const existe = await buscarPorCorreo(correo);
    if (existe) {
      return res.status(409).json({ error: 'Ja existeix un entrenador amb aquest correu.' });
    }

    const nuevoEntrenador = await crearEntrenador(nombre, correo, password);
    res.status(201).json({
      message: 'Entrenador creat correctament',
      entrenador: nuevoEntrenador
    });
  } catch (error) {
    console.error("❌ Error creant entrenador:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  registrarEntrenador
};