const jwt = require("jsonwebtoken");
const db = require("../requests/db"); // Asegúrate que esto apunta a tu conexión

module.exports = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Accés denegat. No hi ha token." });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        const result = await db.query(
            "SELECT entrenador_id, correo, tipo, club_id FROM entrenadores WHERE entrenador_id = $1",
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuari no trobat." });
        }

        req.user = {
            id: result.rows[0].entrenador_id,
            correo: result.rows[0].correo,
            tipo: result.rows[0].tipo,
            club_id: result.rows[0].club_id,
        };

        next();
    } catch (error) {
        console.error("❌ Error verificando token:", error);
        res.status(400).json({ error: "Token inválido." });
    }
};
