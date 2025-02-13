const express = require("express");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware"); // Protecció amb JWT

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 📂 Configuració de Multer per pujar imatges
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, `profile_${req.user.id}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// 🔹 Endpoint per carregar les dades de l'usuari
router.get("/:id", authMiddleware, async (req, res) => {
    const usuario_id = req.params.id;

    try {
        const result = await pool.query("SELECT id, nombre_usuario, correo, profile_image FROM usuarios WHERE id = $1", [usuario_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuari no trobat." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error carregant les dades de l'usuari." });
    }
});

// 🔹 Endpoint per actualitzar nom d'usuari i correu
router.put("/:id", authMiddleware, async (req, res) => {
    const usuario_id = req.params.id;
    const { nombre_usuario, correo } = req.body;

    if (!nombre_usuario || !correo) {
        return res.status(400).json({ error: "Tots els camps són obligatoris." });
    }

    try {
        await pool.query("UPDATE usuarios SET nombre_usuario = $1, correo = $2 WHERE id = $3", [nombre_usuario, correo, usuario_id]);

        res.json({ missatge: "✅ Perfil actualitzat correctament!" });
    } catch (error) {
        res.status(500).json({ error: "❌ No s'ha pogut actualitzar el perfil." });
    }
});

// 🔹 Endpoint per canviar la contrasenya
router.put("/:id/password", authMiddleware, async (req, res) => {
    const usuario_id = req.params.id;
    const { contrasena_actual, contrasena_nova } = req.body;

    if (!contrasena_actual || !contrasena_nova) {
        return res.status(400).json({ error: "Tots els camps són obligatoris." });
    }

    try {
        // 🔍 Obtenir la contrasenya actual de la BD
        const result = await pool.query("SELECT contrasena_hash FROM usuarios WHERE id = $1", [usuario_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuari no trobat." });
        }

        const contrasenaHashActual = result.rows[0].contrasena_hash;

        // 🔑 Verificar la contrasenya actual
        const coincideix = await bcrypt.compare(contrasena_actual, contrasenaHashActual);
        if (!coincideix) {
            return res.status(401).json({ error: "La contrasenya actual és incorrecta." });
        }

        // 🔒 Encriptar la nova contrasenya
        const salt = await bcrypt.genSalt(10);
        const novaContrasenaHash = await bcrypt.hash(contrasena_nova, salt);

        // 📝 Actualitzar la contrasenya a la BD
        await pool.query("UPDATE usuarios SET contrasena_hash = $1 WHERE id = $2", [novaContrasenaHash, usuario_id]);

        res.json({ missatge: "✅ Contrasenya actualitzada correctament!" });
    } catch (error) {
        res.status(500).json({ error: "Error intern del servidor." });
    }
});

// 🔹 Endpoint per pujar una imatge de perfil
router.post("/:id/profile-picture", authMiddleware, upload.single("profileImage"), async (req, res) => {
    const usuario_id = req.params.id;

    if (!req.file) {
        return res.status(400).json({ error: "❌ Selecciona una imatge." });
    }

    const imagePath = req.file.filename; 

    try {
        await pool.query("UPDATE usuarios SET profile_image = $1 WHERE id = $2", [imagePath, usuario_id]);

        res.json({ missatge: "✅ Foto de perfil actualitzada!", profileImage: imagePath });
    } catch (error) {
        res.status(500).json({ error: "❌ Error canviant la foto de perfil." });
    }
});

module.exports = router;
