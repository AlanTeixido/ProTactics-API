const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Accés denegat. No hi ha token." });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            tipo: decoded.tipo,        // "club" o "entrenador"
            correo: decoded.correo
        };
        next();
    } catch (error) {
        console.error("❌ Error verificant token:", error);
        res.status(400).json({ error: "Token invàlid." });
    }
};
