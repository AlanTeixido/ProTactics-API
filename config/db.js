// Single PostgreSQL connection pool shared by the whole API.
const { Pool } = require('pg');
const { databaseUrl, databaseSsl } = require('./env');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseSsl,
});

// An idle client can error (e.g. the server restarts); log it instead of crashing.
pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = pool;
