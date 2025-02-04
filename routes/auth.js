const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require("dotenv").config();

// 🔹 Inicialitzar express Router primer
const router = express.Router();

// 🔹 Inicialitzar la connexió a la BD abans d'usar-la
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Assegurar-se que la carpeta 'uploads/' existeix
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 🔹 Configurar `multer` per a la pujada d'imatges
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Guardar imatges a 'uploads/'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nom únic
    }
});

const upload = multer({ storage });

// 🔹 Endpoint per pujar foto de perfil
router.post("/upload-profile-pic", upload.single('foto'), async (req, res) => {
    try {
        const userId = req.body.id;
        const fotoUrl = `/uploads/${req.file.filename}`; // Guardar la ruta

        // Actualitzar a la BD
        await pool.query("UPDATE usuarios SET foto_url = $1 WHERE id = $2", [fotoUrl, userId]);

        res.json({ message: "Foto de perfil actualitzada!", foto_url: fotoUrl });
    } catch (error) {
        console.error("Error en pujar la foto:", error);
        res.status(500).json({ error: "Error al pujar la imatge" });
    }
});

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

// 🔹 Endpoint per iniciar sessió
router.post("/login", async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ error: "El correu i la contrasenya són obligatoris." });
    }

    try {
        // Buscar usuari a la BD
        const query = "SELECT id, nombre_usuario, correo, contrasena_hash, foto_url FROM usuarios WHERE correo = $1";
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

        // ✅ Generar token JWT amb la imatge de perfil
        const token = jwt.sign(
            {
                id: user.id,
                nombre_usuario: user.nombre_usuario,
                correo: user.correo,
                foto_url: user.foto_url // 🔥 Incloure la foto de perfil al token
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // ✅ Retornar el token i les dades de l'usuari
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
        res.status(500).json({ error: "Error al iniciar sessió." });
    }
});

// Servir imágenes de perfil desde la carpeta 'uploads'
router.use('/uploads', express.static(uploadDir));


module.exports = router;
