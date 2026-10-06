// 404 handler and centralized error handler. Never sends stack traces to clients.

const notFound = (req, res) => {
  res.status(404).json({ error: 'Ruta no trobada.' });
};

// PostgreSQL error codes that are caused by client input, mapped to safe messages.
const PG_CLIENT_ERRORS = {
  '23505': [409, 'Ja existeix un registre amb aquestes dades.'],
  '23503': [400, 'Referència a un registre inexistent.'],
  '23502': [400, 'Falten camps obligatoris.'],
  '23514': [400, 'Algun valor està fora del rang permès.'],
  '22001': [400, 'Algun text és massa llarg.'],
  '22003': [400, 'Algun valor numèric està fora de rang.'],
  '22007': [400, 'Format de data o durada invàlid.'],
  '22008': [400, 'Data fora de rang.'],
  '22P02': [400, 'Format de dades invàlid.'],
};

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: [413, 'L\'arxiu és massa gran.'],
  LIMIT_FILE_COUNT: [400, 'Només es pot enviar un arxiu.'],
  LIMIT_UNEXPECTED_FILE: [400, 'Camp d\'arxiu inesperat.'],
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Body parser errors (malformed JSON, payload too large).
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cos de la petició no és JSON vàlid.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cos de la petició és massa gran.' });
  }

  // Upload errors.
  if (err.name === 'MulterError') {
    const [status, message] = MULTER_MESSAGES[err.code] || [400, 'Error en pujar l\'arxiu.'];
    return res.status(status).json({ error: message });
  }

  // Database errors caused by invalid input.
  if (typeof err.code === 'string' && PG_CLIENT_ERRORS[err.code]) {
    const [status, message] = PG_CLIENT_ERRORS[err.code];
    return res.status(status).json({ error: message });
  }

  // Errors created on purpose with a client-facing status (err.status 4xx + err.expose).
  const status = Number.isInteger(err.status) ? err.status : 500;
  if (status >= 400 && status < 500 && err.expose) {
    return res.status(status).json({ error: err.message });
  }

  console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  return res.status(500).json({ error: 'Error del servidor.' });
};

module.exports = { notFound, errorHandler };
