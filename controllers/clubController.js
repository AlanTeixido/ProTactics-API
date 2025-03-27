const { crearClub, buscarPorCorreo } = require('../models/Club');

const registrarClub = async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Falten dades obligatòries.' });
  }

  try {
    const existe = await buscarPorCorreo(correo);
    if (existe) {
      return res.status(409).json({ error: 'Ja existeix un club amb aquest correu.' });
    }

    const nuevoClub = await crearClub(nombre, correo, password);
    res.status(201).json({
      message: 'Club creat correctament',
      club: nuevoClub
    });
  } catch (error) {
    console.error("❌ Error creant club:", error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

module.exports = {
  registrarClub
};
