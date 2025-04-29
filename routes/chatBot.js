const express = require('express');
const router = express.Router();  // Usamos router de Express para manejar las rutas

// 🔹 Definición de preguntas y respuestas
const preguntasApp = [
  // 🔹 CLUB
  {
    pregunta: "¿Cómo crear un club?",
    clave: ["crear club", "nuevo club"],
    respuesta: "Puedes crear un club desde el apartado superior derecho en la web de la app, una vez hayas iniciado sesión."
  },
  {
    pregunta: "¿Cómo crear un entrenador?",
    clave: ["crear entrenador", "nuevo entrenador"],
    respuesta: "Debes registrar primero un club. Una vez iniciada sesión como club, en el dashboard encontrarás el apartado 'Entrenadores', donde podrás crear uno nuevo."
  },
  {
    pregunta: "¿Cómo crear un equipo?",
    clave: ["crear equipo", "nuevo equipo"],
    respuesta: "Desde el dashboard, accediendo como club, encontrarás un apartado llamado 'Equipos'. Ahí podrás crear un nuevo equipo."
  },
  {
    pregunta: "¿Cómo ver publicaciones como club?",
    clave: ["ver publicaciones club", "publicaciones club"],
    respuesta: "Desde el dashboard accediendo como club, encontrarás un apartado llamado 'Publicaciones', donde verás todas las compartidas por los entrenadores del club."
  },
  {
    pregunta: "¿Cómo editar el perfil como club?",
    clave: ["editar perfil club", "cambiar perfil club"],
    respuesta: "En el menú lateral izquierdo, ve al apartado 'Perfil'. Dentro encontrarás la opción para editarlo."
  },
  {
    pregunta: "¿Cómo ver el perfil como club?",
    clave: ["ver perfil club", "perfil club"],
    respuesta: "Desde el menú lateral izquierdo, accediendo como club, haz clic en 'Perfil' para ver tu información."
  },
  
  // 🔹 ENTRENADOR
  {
    pregunta: "¿Cómo crear un entrenamiento?",
    clave: ["crear entrenamiento", "nuevo entrenamiento"],
    respuesta: "Desde el dashboard, accediendo como entrenador, entra en el apartado 'Entrenamientos'. Ahí podrás crear uno completo, incluyendo el uso de la pizarra táctica."
  },
  {
    pregunta: "¿Cómo editar mi perfil como entrenador?",
    clave: ["editar perfil entrenador", "modificar perfil"],
    respuesta: "Desde el dashboard como entrenador, entra en 'Configuración' o ve al apartado 'Perfil' desde el menú lateral para editar tu información."
  },
  {
    pregunta: "¿Cómo usar la pizarra?",
    clave: ["usar pizarra", "pizarra táctica"],
    respuesta: "Desde el dashboard como entrenador, accede al apartado 'Pizarra'. Puedes usarla libremente y guardar tus progresos como imagen (PNG)."
  },
  {
    pregunta: "¿Cómo ver publicaciones como entrenador?",
    clave: ["ver publicaciones entrenador", "publicaciones"],
    respuesta: "Desde el dashboard como entrenador, entra en el apartado 'Publicaciones' para ver todas las compartidas por otros entrenadores de tu mismo club."
  },
  {
    pregunta: "¿Cómo crear jugadores?",
    clave: ["crear jugadores", "nuevo jugador"],
    respuesta: "Desde el dashboard como entrenador, entra en el apartado 'Jugadores'. Ahí puedes crear jugadores y asignarles diferentes propiedades."
  },
  {
    pregunta: "¿Cómo subir una publicación?",
    clave: ["subir publicación", "publicar entrenamiento"],
    respuesta: "Desde el dashboard como entrenador, entra en 'Subir publicación'. Verás los entrenamientos creados y podrás decidir cuáles compartir."
  },
  {
    pregunta: "¿Cómo ver mi perfil como entrenador?",
    clave: ["ver perfil entrenador", "perfil entrenador"],
    respuesta: "Desde el menú lateral izquierdo, entra en 'Perfil' para ver tu información como entrenador."
  }
];

// Ruta para obtener todas las preguntas
router.get('/preguntas', (req, res) => {
  res.json(preguntasApp);  // Devuelve todas las preguntas definidas en preguntasApp
});

// Ruta para obtener una respuesta basada en una pregunta
router.post('/chat', (req, res) => {
  const { pregunta } = req.body;  // Extraemos la pregunta del cuerpo de la solicitud
  const respuesta = preguntasApp.find(p => p.clave.some(clave => clave.toLowerCase() === pregunta.toLowerCase()));  // Buscamos la respuesta

  if (respuesta) {
    res.json({ respuesta: respuesta.respuesta });  // Si se encuentra, devolvemos la respuesta
  } else {
    res.json({ respuesta: 'Lo siento, no tengo una respuesta para eso.' });  // Si no se encuentra, devolvemos una respuesta por defecto
  }
});

// Exportamos el router para usarlo en el archivo principal (server.js)
module.exports = router;
