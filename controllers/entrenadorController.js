const { crearEntrenador, buscarPorCorreo } = require('../models/Entrenador');
const bcrypt = require('bcryptjs');

const registrarEntrenador = async (req, res) => {
  const { nombre, correo, password, equipo } = req.body;
  const club_id = req.user.id;  // Usamos el id del club desde el middleware de autenticación

  if (!nombre || !correo || !password || !equipo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    console.log("Recibida solicitud para crear entrenador:", { nombre, correo, equipo, club_id });

    const existe = await buscarPorCorreo(correo);
    if (existe) {
      return res.status(409).json({ error: 'Ya existe un entrenador con este correo.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);  // Hasheamos la contraseña

    const nuevoEntrenador = await crearEntrenador(nombre, correo, hashedPassword, equipo, club_id);

    console.log("Entrenador creado:", nuevoEntrenador);
    res.status(201).json({
      message: 'Entrenador creado correctamente',
      entrenador: nuevoEntrenador
    });
  } catch (error) {
    console.error("❌ Error creando entrenador:", error);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
};

module.exports = {
  registrarEntrenador
};
