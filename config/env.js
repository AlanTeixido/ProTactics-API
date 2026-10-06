// Central configuration: reads and validates environment variables once.
require('dotenv').config();

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'];

const missing = REQUIRED.filter((name) => !process.env[name] || !process.env[name].trim());
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill them in.'
  );
}

// DATABASE_SSL: false (default) | true (verify certificate) | no-verify
const parseDatabaseSsl = (value) => {
  const v = (value || 'false').trim().toLowerCase();
  if (['false', '0', 'off', 'no', 'disable'].includes(v)) return false;
  if (['true', '1', 'on', 'yes', 'require', 'verify'].includes(v)) return { rejectUnauthorized: true };
  if (v === 'no-verify') return { rejectUnauthorized: false };
  throw new Error(`Invalid DATABASE_SSL value "${value}". Use false, true or no-verify.`);
};

// CORS_ORIGINS: comma-separated list of allowed browser origins.
const parseOrigins = (value) =>
  (value || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

// TRUST_PROXY: empty/false (default), true, a hop count ("1") or an Express trust-proxy string.
const parseTrustProxy = (value) => {
  const v = (value || '').trim();
  if (!v || v === 'false') return false;
  if (v === 'true') return true;
  if (/^\d+$/.test(v)) return Number(v);
  return v;
};

const jwtSecret = process.env.JWT_SECRET.trim();
if (jwtSecret.length < 32) {
  console.warn('[config] JWT_SECRET is shorter than 32 characters; use a long random value in production.');
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL.trim(),
  databaseSsl: parseDatabaseSsl(process.env.DATABASE_SSL),
  jwtSecret,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '24h').trim(),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
};
