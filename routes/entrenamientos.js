const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Último entrenamiento (público o del usuario autenticado)
router.get("/last", authMiddleware, async (req, res) => {
    const usuario_id = req.user.id;

    try {
        const result = await pool.query(
            `SELECT * FROM entrenamientos WHERE usuario_id = $1 ORDER BY creado_en DESC LIMIT 1`, 
            [usuario_id]
        );
        if (result.rows.length === 0) return res.json({ mensaje: "No hay entrenamientos disponibles." });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error obteniendo último entrenamiento:", error.message);
        res.status(500).json({ error: "Error obteniendo el último entrenamiento." });
    }
});

// 🔹 Entrenamientos públicos
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM entrenamientos WHERE visibilidad = 'publico' ORDER BY creado_en DESC`);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo entrenamientos:", error.message);
        res.status(500).json({ error: "Error obteniendo los entrenamientos." });
    }
});

// 🔹 Entrenamientos de un usuario (autenticado)
router.get("/user/:id", authMiddleware, async (req, res) => {
    const usuario_id = parseInt(req.params.id);

    if (req.user.id !== usuario_id) {
        return res.status(403).json({ error: "🚫 No tienes permisos para ver estos entrenamientos." });
    }

    try {
        const entrenamientosResult = await pool.query(`SELECT * FROM entrenamientos WHERE usuario_id = $1 ORDER BY creado_en DESC`, [usuario_id]);
        const entrenamientos = entrenamientosResult.rows;

        if (entrenamientos.length === 0) return res.json([]);

        const entrenamientoIds = entrenamientos.map(e => e.id);

        const obtenerDetalles = async (tabla) => {
            const result = await pool.query(`SELECT * FROM ${tabla} WHERE entrenamiento_id = ANY($1)`, [entrenamientoIds]);
            return result.rows.reduce((acc, item) => {
                acc[item.entrenamiento_id] = item;
                return acc;
            }, {});
        };

        const detalles = {
            piscina: await obtenerDetalles("entrenamientos_piscina"),
            futbol: await obtenerDetalles("entrenamientos_futbol"),
            ciclismo: await obtenerDetalles("entrenamientos_ciclismo"),
            atletismo: await obtenerDetalles("entrenamientos_atletismo"),
            padel: await obtenerDetalles("entrenamientos_padel"),
            gimnasio: await obtenerDetalles("entrenamientos_gimnasio")
        };

        entrenamientos.forEach(entrenamiento => {
            const tipo = entrenamiento.tipo_deporte;
            entrenamiento.detalles = detalles[tipo]?.[entrenamiento.id] || {};
        });

        res.json(entrenamientos);
    } catch (error) {
        console.error("❌ Error obteniendo entrenamientos:", error.message);
        res.status(500).json({ error: "Error obteniendo los entrenamientos." });
    }
});

// 🔹 Crear entrenamiento
router.post("/", authMiddleware, async (req, res) => {
    const { titulo, tipo_deporte, descripcion, duracion, distancia, calorias_quemadas, inicio, fin, visibilidad, detalles } = req.body;
    const usuario_id = req.user.id;

    if (!titulo || !tipo_deporte || !duracion || !inicio) {
        return res.status(400).json({ error: "❌ Los campos obligatorios no están completos." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO entrenamientos 
            (usuario_id, titulo, tipo_deporte, descripcion, duracion, distancia, calorias_quemadas, inicio, fin, visibilidad, creado_en, actualizado_en) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
            [usuario_id, titulo, tipo_deporte, descripcion, duracion, distancia, calorias_quemadas, inicio, fin, visibilidad || 'privado']
        );

        await guardarDetallesEntrenamiento(result.rows[0].id, tipo_deporte, detalles);
        res.status(201).json({ mensaje: "✅ Entrenamiento creado correctamente.", id: result.rows[0].id });
    } catch (error) {
        console.error("❌ Error creando entrenamiento:", error.message);
        res.status(500).json({ error: "Error creando el entrenamiento." });
    }
});

async function guardarDetallesEntrenamiento(entrenamiento_id, tipo_deporte, detalles) {
    if (!detalles) return;

    let query = "";
    let values = [entrenamiento_id];

    switch (tipo_deporte) {
        case "piscina":
            query = `INSERT INTO entrenamientos_piscina (entrenamiento_id, num_piscinas, tamano_piscina, estilo) VALUES ($1, $2, $3, $4)`;
            values.push(detalles.num_piscinas || 0, detalles.tamano_piscina || "", detalles.estilo || "");
            break;
        case "futbol":
            query = `INSERT INTO entrenamientos_futbol (entrenamiento_id, tipo, posicion, goles, asistencias) VALUES ($1, $2, $3, $4, $5)`;
            values.push(detalles.tipo || "", detalles.posicion || "", detalles.goles || 0, detalles.asistencias || 0);
            break;
        case "ciclismo":
            query = `INSERT INTO entrenamientos_ciclismo (entrenamiento_id, potencia_media, cadencia, velocidad_maxima) VALUES ($1, $2, $3, $4)`;
            values.push(detalles.potencia_media || 0, detalles.cadencia || 0, detalles.velocidad_maxima || 0);
            break;
        case "atletismo":
            query = `INSERT INTO entrenamientos_atletismo (entrenamiento_id, distancia) VALUES ($1, $2)`;
            values.push(detalles.distancia || 0);
            break;
        case "padel":
            query = `INSERT INTO entrenamientos_padel (entrenamiento_id, sets, puntos_ganados, superficie) VALUES ($1, $2, $3, $4)`;
            values.push(detalles.sets || 0, detalles.puntos_ganados || 0, detalles.superficie || "");
            break;
        case "gimnasio":
            query = `INSERT INTO entrenamientos_gimnasio (entrenamiento_id, tipo, musculos) VALUES ($1, $2, $3)`;
            values.push(detalles.tipo || "", detalles.musculos || "");
            break;
        default:
            return; 
    }

    if (query) await pool.query(query, values);
}

// 🔹 Eliminar entrenamiento
router.delete("/:id", authMiddleware, async (req, res) => {
    const entrenamiento_id = req.params.id;

    try {
        const entrenamiento = await pool.query("SELECT usuario_id, tipo_deporte FROM entrenamientos WHERE id = $1", [entrenamiento_id]);
        if (entrenamiento.rows.length === 0) return res.status(404).json({ error: "Entrenamiento no encontrado." });

        if (entrenamiento.rows[0].usuario_id !== req.user.id) {
            return res.status(403).json({ error: "🚫 No tienes permiso para eliminar este entrenamiento." });
        }

        await pool.query(`DELETE FROM entrenamientos_${entrenamiento.rows[0].tipo_deporte} WHERE entrenamiento_id = $1`, [entrenamiento_id]);
        await pool.query("DELETE FROM entrenamientos WHERE id = $1", [entrenamiento_id]);
        res.json({ mensaje: "✅ Entrenamiento eliminado correctamente." });
    } catch (error) {
        console.error("❌ Error eliminando entrenamiento:", error.message);
        res.status(500).json({ error: "Error eliminando el entrenamiento." });
    }
});

module.exports = router;
