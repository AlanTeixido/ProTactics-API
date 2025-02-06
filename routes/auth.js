const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require('pg');

require("dotenv").config();

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
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

// Endpoint para iniciar sesión
router.post("/login", async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const query = "SELECT id, nombre_usuario, correo, contrasena_hash FROM usuarios WHERE correo = $1";
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
                correo: user.correo
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login exitoso",
            token,
            id: user.id,
            nombre_usuario: user.nombre_usuario,
            correo: user.correo
        });
    } catch (error) {
        console.error("Error en /login:", error);
        res.status(500).json({ error: "Error al iniciar sesión." });
    }
});

module.exports = router;
