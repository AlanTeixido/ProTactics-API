// Fail fast with a clear message if the configuration is incomplete.
let config;
try {
  config = require('./config/env');
} catch (err) {
  console.error(`[config] ${err.message}`);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const clubsRoutes = require('./routes/clubs');
const entrenadoresRoutes = require('./routes/entrenadores');
const jugadoresRoutes = require('./routes/jugadores');
const publicacionesRoutes = require('./routes/publicaciones');
const usuariosRoutes = require('./routes/usuarios');
const equiposRoutes = require('./routes/equipos');
const entrenamientosRoutes = require('./routes/entrenamientos');
const chatbotRoutes = require('./routes/chatBot');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { authRateLimit } = require('./middleware/rateLimit');

const app = express();
app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', config.trustProxy);

// CORS: only the origins listed in CORS_ORIGINS. Requests without an Origin
// header (curl, server-to-server) are not subject to CORS.
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || config.corsOrigins.includes(origin)),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));

// API routes
app.use('/auth', authRateLimit, authRoutes);
app.use('/clubes', clubsRoutes);
app.use('/entrenadores', entrenadoresRoutes);
app.use('/jugadores', jugadoresRoutes);
app.use('/publicaciones', publicacionesRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/equipos', equiposRoutes);
app.use('/entrenamientos', entrenamientosRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('🚀 API de ProTactics operativa!');
});

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}

module.exports = app;
