const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Accés denegat. No hi ha token." });
    }

    try {
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = verified; // El token ja conté `id` de l'usuari
        next();
    } catch (error) {
        res.status(400).json({ error: "Token invàlid." });
    }
};
