const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require("dotenv").config();

// 🔹 Inicialitzar express Router primer
const router = express.Router();

// 🔹 Inicialitzar la connexió a la BD abans d'usar-la
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Configurar Cloudinary amb les teves credencials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar Multer per pujar imatges directament a Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'profile_pics', // Carpeta on es guardaran les fotos de perfil
        allowedFormats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 300, height: 300, crop: 'limit' }]
    },
});

const upload = multer({ storage });


// 🔹 Endpoint per registrar un usuari
router.post("/register", async (req, res) => {
    const { nombre_usuario, correo, contrasena } = req.body;

    if (!nombre_usuario || !correo || !contrasena) {
        return res.status(400).json({ error: "Tots els camps són obligatoris." });
    }

    try {
        // Comprovar si l'usuari ja existeix
        const userExists = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [correo]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: "El correu ja està registrat." });
        }

        // Encriptar la contrasenya
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Inserir nou usuari
        const query = "INSERT INTO usuarios (nombre_usuario, correo, contrasena_hash) VALUES ($1, $2, $3) RETURNING id, nombre_usuario, correo";
        const values = [nombre_usuario, correo, hashedPassword];
        const result = await pool.query(query, values);

        res.status(201).json({ message: "Usuari registrat correctament.", user: result.rows[0] });
    } catch (error) {
        console.error("Error en /register:", error);
        res.status(500).json({ error: "Error al registrar l'usuari." });
    }
});

// Endpoint para iniciar sesión
router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
      const query = "SELECT id, nombre_usuario, correo, contrasena_hash, foto_url FROM usuarios WHERE correo = $1";
      const result = await pool.query(query, [correo]);

      if (result.rows.length === 0) {
          return res.status(401).json({ error: "Usuario no encontrado." });
      }

      const user = result.rows[0];

      // Comprobar la contraseña
      const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);
      if (!isMatch) {
          return res.status(401).json({ error: "Contraseña incorrecta." });
      }

      // Generar el token JWT
      const token = jwt.sign(
          {
              id: user.id,
              nombre_usuario: user.nombre_usuario,
              correo: user.correo,
              foto_url: user.foto_url
          },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
      );

      res.json({
          message: "Login exitoso",
          token,
          id: user.id,
          nombre_usuario: user.nombre_usuario,
          correo: user.correo,
          foto_url: user.foto_url
      });
  } catch (error) {
      console.error("Error en /login:", error);
      res.status(500).json({ error: "Error al iniciar sesión." });
  }
});

// Endpoint upload foto de perfil 
router.post("/upload-profile-pic", upload.single('foto'), async (req, res) => {
    try {
        console.log("📷 Fitxer rebut per Cloudinary:", req.file);
        console.log("🔎 Dades rebudes:", req.body);

        const userId = req.body.id;
        if (!req.file || !req.file.secure_url) {
            console.error("❌ Error: No s'ha rebut cap fitxer o Cloudinary no ha retornat una URL.");
            return res.status(400).json({ error: "No s'ha pujat cap imatge." });
        }

        const fotoUrl = req.file.secure_url;
        console.log(`✅ Foto pujada correctament: ${fotoUrl}`);

        // Guardar la URL de la imatge a la BD
        const result = await pool.query(
            "UPDATE usuarios SET foto_url = $1 WHERE id = $2 RETURNING *",
            [fotoUrl, userId]
        );

        console.log("✅ Base de dades actualitzada:", result.rows[0]);

        res.json({ message: "Foto de perfil actualitzada!", foto_url: fotoUrl });
    } catch (error) {
        console.error("❌ Error en la pujada de la foto:", error);
        res.status(500).json({ error: "Error al pujar la imatge." });
    }
});



module.exports = router;
    