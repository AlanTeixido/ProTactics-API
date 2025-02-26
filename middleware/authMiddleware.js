const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Accés denegat. No hi ha token." });
    }

    const token = authHeader.split(" ")[1]; // 🔹 Agafa el token després de "Bearer "

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ✅ Guarda les dades de l'usuari autenticat
        next();
    } catch (error) {
        console.error("❌ Error de token:", error);
        return res.status(403).json({ error: "Token invàlid o caducat." });
    }
};
