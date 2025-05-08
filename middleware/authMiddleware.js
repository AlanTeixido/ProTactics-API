const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Accés denegat. No hi ha token." });
  }

  try {
    const tokenValue = token.split(" ")[1];
    console.log("🔐 [MIDDLEWARE] Token recibido:", tokenValue);
    console.log("🧪 [MIDDLEWARE] JWT_SECRET desde env:", process.env.JWT_SECRET);
    console.log("🔍 [MIDDLEWARE] Intentando verificar token:", tokenValue); // <---- CHIVATO

    const secretParaVerificar = "super_secret_key_1234"; // 👈 AÑADE ESTA LÍNEA
    const decoded = jwt.verify(tokenValue, secretParaVerificar); // 👈 USA secretParaVerificar AQUÍ

    req.user = {
      id: decoded.id,
      tipo: decoded.tipo,
      correo: decoded.correo,
    };
    next();
  } catch (error) {
    console.error("❌ [MIDDLEWARE] Error verificando token:", error);
    res.status(400).json({ error: "Token inválido." });
  }
};