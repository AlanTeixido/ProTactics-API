const express = require("express");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware"); // Protecció amb JWT

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Endpoint per canviar la contrasenya
router.put("/", authMiddleware, async (req, res) => {
    const { contrasena_actual, contrasena_nova } = req.body;
    const usuario_id = req.user.id; // ID de l'usuari autenticat

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

        res.json({ missatge: "Contrasenya actualitzada correctament." });
    } catch (error) {
        res.status(500).json({ error: "Error intern del servidor." });
    }
});

module.exports = router;
