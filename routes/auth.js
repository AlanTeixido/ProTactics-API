const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

require("dotenv").config();

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Ruta de autenticación funcionando 🚀" });
});


// Registro de usuario
router.post("/register", async (req, res) => {
  const { nombre_usuario, correo, contrasena } = req.body;

  if (!nombre_usuario || !correo || !contrasena) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    // Verificar si el correo ya está en la BD
    const userExists = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [correo]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado." });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Insertar usuario
    const query = "INSERT INTO usuarios (nombre_usuario, correo, contrasena_hash) VALUES ($1, $2, $3) RETURNING id, nombre_usuario, correo";
    const values = [nombre_usuario, correo, hashedPassword];
    const result = await pool.query(query, values);

    res.status(201).json({ message: "Usuario registrado correctamente.", user: result.rows[0] });
  } catch (error) {
    console.error("Error en /register:", error);
    res.status(500).json({ error: "Error al registrar usuario." });
  }
});

  
router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "El correu i la contrasenya són obligatoris." });
  }

  try {
    // Buscar usuari a la BD
    const query = "SELECT id, nombre_usuario, correo, contrasena_hash FROM usuarios WHERE correo = $1";
    const result = await pool.query(query, [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuari no trobat." });
    }

    const user = result.rows[0];

    // Comprovar la contrasenya
    const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Contrasenya incorrecta." });
    }

    // ✅ Afegim `nombre_usuario` i `correo` correctament al token
    const token = jwt.sign(
      {
        id: user.id,
        nombre_usuario: user.nombre_usuario,  // 🔥 Afegeix aquest camp al JWT
        correo: user.correo                   // 🔥 També assegura que el correu hi és
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // ✅ Ara retornem el token juntament amb `nombre_usuario` i `correo`
    res.json({
      message: "Login exitoso",
      token,
      id: user.id,
      nombre_usuario: user.nombre_usuario,
      correo: user.correo
    });

  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ error: "Error al iniciar sessió." });
  }
});


module.exports = router;
