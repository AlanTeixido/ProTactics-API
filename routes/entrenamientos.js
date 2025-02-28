const express = require("express");
const { Pool } = require("pg");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 🔹 Obtenir l'últim entrenament públic o de l'usuari autenticat
router.get("/last", async (req, res) => {
    const usuario_id = req.user?.id || null; // Opcional: Si hi ha usuari autenticat

    try {
        let query;
        let params;

        if (usuario_id) {
            // Si està autenticat, obté l'últim entrenament de l'usuari
            query = `
                SELECT * FROM entrenamientos 
                WHERE usuario_id = $1 
                ORDER BY creado_en DESC 
                LIMIT 1
            `;
            params = [usuario_id];
        } else {
            // Si no, mostra l'últim entrenament públic
            query = `
                SELECT * FROM entrenamientos 
                WHERE visibilidad = 'publico' 
                ORDER BY creado_en DESC 
                LIMIT 1
            `;
            params = [];
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.json({ mensaje: "No hi ha entrenaments disponibles." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error obtenint l'últim entrenament:", error);
        res.status(500).json({ error: "❌ Error obtenint l'últim entrenament." });
    }
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
        const entrenamientosQuery = `SELECT * FROM entrenamientos WHERE usuario_id = $1 ORDER BY creado_en DESC`;
        const entrenamientosResult = await pool.query(entrenamientosQuery, [usuario_id]);

        const entrenamientos = entrenamientosResult.rows;

        if (entrenamientos.length === 0) return res.json([]);

        const entrenamientoIds = entrenamientos.map(e => e.id);

        const obtenerDetalles = async (tabla) => {
            const query = `SELECT * FROM ${tabla} WHERE entrenamiento_id = ANY($1)`;
            return (await pool.query(query, [entrenamientoIds])).rows.reduce((acc, item) => {
                acc[item.entrenamiento_id] = item;
                return acc;
            }, {});
        };

        const detalles = {
            piscina: await obtenerDetalles("entrenamientos_piscina"),
            futbol: await obtenerDetalles("entrenamientos_futbol"),
            ciclismo: await obtenerDetalles("entrenamientos_ciclismo"),
            running: await obtenerDetalles("entrenamientos_running"),
            padel: await obtenerDetalles("entrenamientos_padel"),
        };

        entrenamientos.forEach(entrenamiento => {
            entrenamiento.detalles = detalles[entrenamiento.tipo_deporte]?.[entrenamiento.id] || {};
        });

        res.json(entrenamientos);
    } catch (error) {
        console.error("❌ Error obteniendo entrenamientos:", error);
        res.status(500).json({ error: "❌ Error obteniendo los entrenamientos." });
    }
});




router.post("/", async (req, res) => {
    const {
        usuario_id,
        nombre,
        descripcion,
        fecha,
        duracion,
        dificultad,
        visibilidad,
        tipo_deporte,
        detalles
    } = req.body;

    if (!usuario_id || !nombre || !fecha || !duracion || !tipo_deporte) {
        return res.status(400).json({ error: "❌ Falten camps obligatoris." });
    }

    try {
        const result = await pool.query(`
            INSERT INTO entrenamientos (usuario_id, nombre, descripcion, fecha, duracion, dificultad, visibilidad, tipo_deporte, creado_en)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id
        `, [usuario_id, nombre, descripcion, fecha, duracion, dificultad, visibilidad || 'privado', tipo_deporte]);

        const entrenamiento_id = result.rows[0].id;

        await guardarDetallsEntrenament(entrenamiento_id, tipo_deporte, detalles);

        res.status(201).json({ mensaje: "✅ Entrenamiento guardado correctamente.", id: entrenamiento_id });
    } catch (error) {
        console.error("❌ Error guardando entrenamiento:", error);
        res.status(500).json({ error: "❌ Error guardando el entrenamiento." });
    }
});

// Funció auxiliar per guardar els detalls específics
router.post("/", async (req, res) => {
    const {
        usuario_id,
        nombre,
        descripcion,
        fecha,
        duracion,
        dificultad,
        visibilidad,
        tipo_deporte,
        detalles
    } = req.body;

    if (!usuario_id || !nombre || !fecha || !duracion || !tipo_deporte) {
        return res.status(400).json({ error: "❌ Falten camps obligatoris." });
    }

    try {
        const result = await pool.query(`
            INSERT INTO entrenamientos (usuario_id, nombre, descripcion, fecha, duracion, dificultad, visibilidad, tipo_deporte, creado_en)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id
        `, [usuario_id, nombre, descripcion, fecha, duracion, dificultad, visibilidad || 'privado', tipo_deporte]);

        const entrenamiento_id = result.rows[0].id;

        await guardarDetallsEntrenament(entrenamiento_id, tipo_deporte, detalles);

        res.status(201).json({ mensaje: "✅ Entrenamiento guardado correctamente.", id: entrenamiento_id });
    } catch (error) {
        console.error("❌ Error guardando entrenamiento:", error);
        res.status(500).json({ error: "❌ Error guardando el entrenamiento." });
    }
});

async function guardarDetallsEntrenament(entrenamiento_id, tipo_deporte, detalles) {
    if (!detalles) return;

    let query = "";
    let values = [entrenamiento_id];

    switch (tipo_deporte) {
        case "ciclismo":
            query = `
                INSERT INTO entrenamientos_ciclismo (entrenamiento_id, velocidad, potencia, cadencia, velocidad_maxima)
                VALUES ($1, $2, $3, $4, $5)
            `;
            values.push(detalles.velocidad || 0, detalles.potencia || 0, detalles.cadencia || 0, detalles.velocidad_maxima || 0);
            break;

        case "futbol":
            query = `
                INSERT INTO entrenamientos_futbol (entrenamiento_id, tipo, posicion, goles, asistencias)
                VALUES ($1, $2, $3, $4, $5)
            `;
            values.push(detalles.tipo || "", detalles.posicion || "", detalles.goles || 0, detalles.asistencias || 0);
            break;

        case "running":
            query = `
                INSERT INTO entrenamientos_running (entrenamiento_id, ritmo_medio, altimetria, zancada_media)
                VALUES ($1, $2, $3, $4)
            `;
            values.push(detalles.ritmo_medio || "", detalles.altimetria || "", detalles.zancada_media || "");
            break;

        case "piscina":
            query = `
                INSERT INTO entrenamientos_piscina (entrenamiento_id, num_piscinas, tamano_piscina, estilo)
                VALUES ($1, $2, $3, $4)
            `;
            values.push(detalles.num_piscinas || 0, detalles.tamano_piscina || "", detalles.estilo || "");
            break;

        case "padel":
            query = `
                INSERT INTO entrenamientos_padel (entrenamiento_id, sets, puntos_ganados, superficie)
                VALUES ($1, $2, $3, $4)
            `;
            values.push(detalles.sets || 0, detalles.puntos_ganados || 0, detalles.superficie || "");
            break;

        case "gimnasio":
            query = `
                INSERT INTO entrenamientos_gimnasio (entrenamiento_id, tipo, musculos)
                VALUES ($1, $2, $3)
            `;
            values.push(detalles.tipo || "", detalles.musculos || "");
            break;

        case "atletismo":
            query = `
                INSERT INTO entrenamientos_atletismo (entrenamiento_id, distancia)
                VALUES ($1, $2)
            `;
            values.push(detalles.distancia || 0);
            break;
    }

    if (query) {
        await pool.query(query, values);
    }
}


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

// Ruta per obtenir els entrenaments recents
router.get('/entrenamientos/recent', async (req, res) => {
    try {
      const recentTrainings = await db.Entrenamiento.findAll({
        where: {
          usuario_id: req.user.id,
        },
        order: [['inicio', 'DESC']],
        limit: 5, // Mostrem els 5 últims entrenaments
      });
  
      res.json(recentTrainings);
    } catch (error) {
      console.error('Error obtenint els entrenaments recents:', error);
      res.status(500).send('Error en el servidor');
    }
  });
  



module.exports = router;
