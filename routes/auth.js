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
      // Asegurar que la contraseña se encripta ANTES de guardarla
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(contrasena, salt);
  
      // Insertar usuario en la base de datos con contraseña encriptada
      const query = "INSERT INTO usuarios (nombre_usuario, correo, contrasena_hash) VALUES ($1, $2, $3) RETURNING id, nombre_usuario, correo";
      const values = [nombre_usuario, correo, hashedPassword];
      const result = await pool.query(query, values);
  
      res.status(201).json({ message: "Usuario registrado correctamente.", user: result.rows[0] });
    } catch (error) {
      console.error("Error en /register:", error);
      res.status(500).json({ error: "Error al registrar usuario." });
    }
  });
  

// Login de usuario
router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
  }

  try {
    // Buscar usuario en la BD
    const query = "SELECT * FROM usuarios WHERE correo = $1";
    const result = await pool.query(query, [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado." });
    }

    const user = result.rows[0];

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: user.id, nombre_usuario: user.nombre_usuario, correo: user.correo },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ message: "Login exitoso", token });
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ error: "Error al iniciar sesión." });
  }
});

module.exports = router;
