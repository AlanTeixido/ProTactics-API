const express = require("express");
const router = express.Router();

const preguntasApp = [
  {
    pregunta: "¿Cómo crear un entrenamiento?",
    clave: ["crear entrenamiento", "nuevo entrenamiento"],
    respuesta: "Para crear un entrenamiento, ve al menú 'Entrenamientos' y haz clic en 'Nuevo'. Completa los campos y guarda.",
  },
  {
    pregunta: "¿Cómo crear un club?",
    clave: ["crear club", "nuevo club"],
    respuesta: "Desde el menú 'Clubes', haz clic en 'Crear Club'. Asigna nombre, descripción, y guarda los cambios.",
  },
  {
    pregunta: "¿Cómo ver las publicaciones?",
    clave: ["ver publicaciones", "noticias", "posts"],
    respuesta: "Haz clic en el menú 'Publicaciones' y verás las más recientes de tus amigos y clubes.",
  },
  {
    pregunta: "¿Cómo ver mi perfil?",
    clave: ["ver perfil", "mi perfil", "perfil usuario"],
    respuesta: "Pulsa en tu foto de perfil o el icono superior derecho, y elige 'Ver Perfil'.",
  },
  {
    pregunta: "¿Cómo editar mi cuenta?",
    clave: ["editar cuenta", "cambiar datos", "ajustes"],
    respuesta: "Desde el menú de usuario, selecciona 'Configuración' o 'Cuenta', donde puedes modificar tus datos.",
  },
];

// Ruta para obtener las preguntas sugeridas
router.get("/preguntas", (req, res) => {
  const preguntas = preguntasApp.map((p) => p.pregunta);
  res.json({ preguntas });
});

// Ruta para responder a las preguntas del usuario
router.post("/chat", (req, res) => {
  const { message } = req.body;
  const mensaje = message.toLowerCase();

  let respuesta = "Lo siento, no entendí tu pregunta. Intenta con otra frase.";

  for (let item of preguntasApp) {
    if (item.clave.some((palabra) => mensaje.includes(palabra))) {
      respuesta = item.respuesta;
      break;
    }
  }

  res.json({ reply: respuesta });
});

module.exports = router;
