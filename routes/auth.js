// auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

//
// 🔹 CLUB REGISTER
//
router.post("/register/club", async (req, res) => {
    const { nombre, correo, password, ubicacion } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: "Tots els camps són obligatoris." });
    }

    try {
        const existe = await pool.query("SELECT club_id FROM clubs WHERE correo = $1", [correo]);
        if (existe.rows.length > 0) {
            return res.status(409).json({ error: "El correu ja està registrat com a club." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(`
            INSERT INTO clubs (nombre, correo, password, ubicacion) 
            VALUES ($1, $2, $3, $4) RETURNING club_id, nombre, correo
        `, [nombre, correo, hashedPassword, ubicacion]);

        res.status(201).json({ message: "✅ Club registrat!", club: result.rows[0] });
    } catch (error) {
        console.error("❌ Error en /register/club:", error);
        res.status(500).json({ error: "Error registrant el club." });
    }
});

//
// 🔹 ENTRENADOR REGISTER
//
router.post("/register/entrenador", async (req, res) => {
    const { nombre, correo, password, equipo, club_id } = req.body;

    if (!nombre || !correo || !password || !club_id) {
        return res.status(400).json({ error: "Tots els camps són obligatoris." });
    }

    try {
        const existe = await pool.query("SELECT entrenador_id FROM entrenadores WHERE correo = $1", [correo]);
        if (existe.rows.length > 0) {
            return res.status(409).json({ error: "El correu ja està registrat com a entrenador." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(`
            INSERT INTO entrenadores (nombre, correo, password, equipo, club_id) 
            VALUES ($1, $2, $3, $4, $5) RETURNING entrenador_id, nombre, correo
        `, [nombre, correo, hashedPassword, equipo, club_id]);

        res.status(201).json({ message: "✅ Entrenador registrat!", entrenador: result.rows[0] });
    } catch (error) {
        console.error("❌ Error en /register/entrenador:", error);
        res.status(500).json({ error: "Error registrant l'entrenador." });
    }
});

//
// 🔐 LOGIN UNIFICAT (detecta club o entrenador)
//
router.post("/login", async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: "Falten dades." });
    }

    try {
        // Provar login com a club
        const clubResult = await pool.query("SELECT club_id, nombre, correo, password FROM clubs WHERE correo = $1", [correo]);
        if (clubResult.rows.length > 0) {
            const club = clubResult.rows[0];
            const match = await bcrypt.compare(password, club.password);
            if (!match) return res.status(401).json({ error: "Contrasenya incorrecta." });

            const token = jwt.sign({ id: club.club_id, tipo: "club", correo: club.correo }, process.env.JWT_SECRET, { expiresIn: "24h" });
            return res.json({ message: "Login club correcte", token, rol: "club", id: club.club_id, nombre: club.nombre });
        }

        // Provar login com a entrenador
        const entrenadorResult = await pool.query("SELECT entrenador_id, nombre, correo, password, club_id FROM entrenadores WHERE correo = $1", [correo]);
        if (entrenadorResult.rows.length > 0) {
            const entrenador = entrenadorResult.rows[0];
            const match = await bcrypt.compare(password, entrenador.password);
            if (!match) return res.status(401).json({ error: "Contrasenya incorrecta." });

            const token = jwt.sign({ id: entrenador.entrenador_id, tipo: "entrenador", correo: entrenador.correo }, process.env.JWT_SECRET, { expiresIn: "24h" });
            return res.json({ message: "Login entrenador correcte", token, rol: "entrenador", id: entrenador.entrenador_id, nombre: entrenador.nombre });
        }

        return res.status(404).json({ error: "Usuari no trobat." });
    } catch (error) {
        console.error("❌ Error en /login:", error);
        res.status(500).json({ error: "Error iniciant sessió." });
    }
});

module.exports = router;
