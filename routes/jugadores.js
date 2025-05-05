const express = require('express');
const router = express.Router();
const multer = require('multer');

// Aquí configuramos multer para que guarde los archivos en la carpeta 'uploads/'.
// Asegúrate de que esta carpeta exista en tu proyecto.
const upload = multer({ dest: 'uploads/' }); // Directorio temporal donde Multer almacenará el archivo subido

const {
  registrarJugador,
  obtenerJugadoresPorEntrenador,
  eliminarJugador,
  obtenerJugadorPorId,
  actualizarJugador,
  obtenerJugadoresPorEquipoController,
  subirJugadoresDesdeCSV
} = require('../controllers/jugadorController');

// Middleware de autenticación (asegúrate de que este middleware esté correctamente configurado)
const authMiddleware = require('../middleware/authMiddleware');

// Definir las rutas relacionadas con los jugadores

// Ruta para registrar un jugador
router.post('/register', authMiddleware, registrarJugador);

// Ruta para obtener todos los jugadores del entrenador
router.get('/', authMiddleware, obtenerJugadoresPorEntrenador);

// Ruta para obtener un jugador por su ID
router.get('/:id', authMiddleware, obtenerJugadorPorId);

// Ruta para actualizar los datos de un jugador
router.put('/:id', authMiddleware, actualizarJugador);

// Ruta para eliminar un jugador por su ID
router.delete('/:id', authMiddleware, eliminarJugador);

// Ruta para obtener jugadores por equipo
router.get('/equipo/:equipo_id', authMiddleware, obtenerJugadoresPorEquipoController);

// 🚨 NUEVA RUTA PARA SUBIR CSV
// Esta ruta es para que el frontend pueda enviar un archivo CSV y crear jugadores desde allí.
// Multer recibirá el archivo como 'csv', que es el nombre que le damos en el formulario de subida.
router.post('/upload-csv', authMiddleware, upload.single('csv'), subirJugadoresDesdeCSV);

module.exports = router;
