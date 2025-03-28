const bcrypt = require('bcryptjs');
const { crearEntrenador, buscarPorCorreo } = require('../models/Entrenador');

const registrarEntrenador = async (req, res) => {
  const { nombre, correo, password, equipo } = req.body;
  const club_id = req.user.id;

  if (!nombre || !correo || !password || !equipo) {
    return res.status(400).json({ error: 'Tots els camps són obligatoris.' });
  }

  try {
    console.log("Rebut sol·licitud per crear entrenador:", { nombre, correo, equipo, club_id });

    const existe = await buscarPorCorreo(correo);
    if (existe) {
      return res.status(409).json({ error: 'Ja existeix un entrenador amb aquest correu.' });
    }

    // Cifrar la contrasenya
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Contrassenya xifrada:", hashedPassword);

    const nuevoEntrenador = await crearEntrenador(nombre, correo, hashedPassword, equipo, club_id);
    console.log("Entrenador creat:", nuevoEntrenador);

    res.status(201).json({
      message: 'Entrenador creat correctament',
      entrenador: nuevoEntrenador
    });
  } catch (error) {
    console.error("❌ Error creant entrenador:", error);
    res.status(500).json({ error: 'Error del servidor.', message: error.message, stack: error.stack });
  }
};

module.exports = {
  registrarEntrenador
};
