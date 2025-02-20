const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtener todos los entrenamientos públicos
router.get("/", async (req, res) => {
    try {
        const query = `SELECT * FROM entrenamientos WHERE visibilidad = 'publico' ORDER BY creado_en DESC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo entrenamientos:", error);
        res.status(500).json({ error: "❌ Error obteniendo los entrenamientos." });
    }
});

// 🔹 Obtener todos los entrenamientos de un usuario con detalles específicos
router.get("/user/:id", async (req, res) => {
    const usuario_id = req.params.id;

    try {
        // Obtener entrenamientos generales
        const entrenamientosQuery = `SELECT * FROM entrenamientos WHERE usuario_id = $1 ORDER BY creado_en DESC`;
        const entrenamientosResult = await pool.query(entrenamientosQuery, [usuario_id]);

        const entrenamientos = entrenamientosResult.rows;

        // Comprobar si hay entrenamientos
        if (entrenamientos.length === 0) {
            return res.json([]);
        }

        // Recoger todos los ids de entrenamientos
        const entrenamientoIds = entrenamientos.map(e => e.id);

        // Consultas específicas por cada tipo de deporte
        const detallesPiscina = await pool.query(`SELECT * FROM entrenamientos_piscina WHERE entrenamiento_id = ANY($1)`, [entrenamientoIds]);
        const detallesFutbol = await pool.query(`SELECT * FROM entrenamientos_futbol WHERE entrenamiento_id = ANY($1)`, [entrenamientoIds]);
        const detallesCiclismo = await pool.query(`SELECT * FROM entrenamientos_ciclismo WHERE entrenamiento_id = ANY($1)`, [entrenamientoIds]);
        const detallesRunning = await pool.query(`SELECT * FROM entrenamientos_running WHERE entrenamiento_id = ANY($1)`, [entrenamientoIds]);
        const detallesPadel = await pool.query(`SELECT * FROM entrenamientos_padel WHERE entrenamiento_id = ANY($1)`, [entrenamientoIds]);

        // Crear un mapa de detalles
        const mapDetalles = (detalles) => {
            return detalles.rows.reduce((acc, item) => {
                acc[item.entrenamiento_id] = item;
                return acc;
            }, {});
        };

        // Mapear los detalles en un objeto
        const detallesMap = {
            piscina: mapDetalles(detallesPiscina),
            futbol: mapDetalles(detallesFutbol),
            ciclismo: mapDetalles(detallesCiclismo),
            running: mapDetalles(detallesRunning),
            padel: mapDetalles(detallesPadel),
        };

        // Asignar los detalles correspondientes a cada entrenamiento
        entrenamientos.forEach(entrenamiento => {
            entrenamiento.detalles = detallesMap[entrenamiento.tipo_deporte]?.[entrenamiento.id] || {};
        });

        res.json(entrenamientos);
    } catch (error) {
        console.error("❌ Error obteniendo entrenamientos:", error);
        res.status(500).json({ error: "❌ Error obteniendo los entrenamientos." });
    }
});



// 🔹 Crear un nuevo entrenamiento con detalles específicos
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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *`,
            [usuario_id, titulo, tipo_deporte, descripcion, duracion, distancia, calorias_quemadas, inicio, fin, visibilidad || 'privado']
        );

        const entrenamiento_id = result.rows[0].id;

        let insertQuery = "";
        let insertValues = [entrenamiento_id];

        switch (tipo_deporte) {
            case "piscina":
                insertQuery = `INSERT INTO entrenamientos_piscina (entrenamiento_id, num_piscinas, tamano_piscina, estilo) VALUES ($1, $2, $3, $4)`;
                insertValues.push(detalles.num_piscinas, detalles.tamano_piscina, detalles.estilo);
                break;
            case "futbol":
                insertQuery = `INSERT INTO entrenamientos_futbol (entrenamiento_id, tipo, posicion, goles, asistencias) VALUES ($1, $2, $3, $4, $5)`;
                insertValues.push(detalles.tipo, detalles.posicion, detalles.goles, detalles.asistencias);
                break;
            case "ciclismo":
                insertQuery = `INSERT INTO entrenamientos_ciclismo (entrenamiento_id, potencia_media, cadencia, velocidad_maxima) VALUES ($1, $2, $3, $4)`;
                insertValues.push(detalles.potencia_media, detalles.cadencia, detalles.velocidad_maxima);
                break;
            case "running":
                insertQuery = `INSERT INTO entrenamientos_running (entrenamiento_id, ritmo_medio, altimetria, zancada_media) VALUES ($1, $2, $3, $4)`;
                insertValues.push(detalles.ritmo_medio, detalles.altimetria, detalles.zancada_media);
                break;
            case "padel":
                insertQuery = `INSERT INTO entrenamientos_padel (entrenamiento_id, sets, puntos_ganados, superficie) VALUES ($1, $2, $3, $4)`;
                insertValues.push(detalles.sets, detalles.puntos_ganados, detalles.superficie);
                break;
        }

        if (insertQuery) {
            await pool.query(insertQuery, insertValues);
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error creando entrenamiento:", error);
        res.status(500).json({ error: "❌ Error creando el entrenamiento." });
    }
});

// 🔹 Eliminar un entrenamiento y sus detalles
router.delete("/:id", authMiddleware, async (req, res) => {
    const entrenamiento_id = req.params.id;
    const usuario_id = req.user.id;

    try {
        const entrenamiento = await pool.query("SELECT usuario_id, tipo_deporte FROM entrenamientos WHERE id = $1", [entrenamiento_id]);

        if (entrenamiento.rows.length === 0) {
            return res.status(404).json({ error: "❌ Entrenamiento no encontrado." });
        }

        if (entrenamiento.rows[0].usuario_id !== usuario_id) {
            return res.status(403).json({ error: "🚫 No tienes permiso para eliminar este entrenamiento." });
        }

        const deleteQuery = `DELETE FROM entrenamientos_${entrenamiento.rows[0].tipo_deporte} WHERE entrenamiento_id = $1`;
        await pool.query(deleteQuery, [entrenamiento_id]);

        await pool.query("DELETE FROM entrenamientos WHERE id = $1", [entrenamiento_id]);

        res.json({ mensaje: "✅ Entrenamiento eliminado correctamente." });
    } catch (error) {
        console.error("❌ Error eliminando entrenamiento:", error);
        res.status(500).json({ error: "❌ Error eliminando el entrenamiento." });
    }
});

module.exports = router;
