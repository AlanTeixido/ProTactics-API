// Small, dependency-free input validation used at the route boundary.

const MAX_INT = 2147483647;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const INTERVAL_UNITS = ['years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'];
const INTERVAL_TEXT_RE = /^[0-9a-z :.-]{1,50}$/i;

const isAbsent = (value) => value === undefined || value === null || value === '';

const toInt = (value) => {
  if (typeof value === 'number') return Number.isInteger(value) ? value : NaN;
  if (typeof value === 'string' && /^-?\d{1,10}$/.test(value.trim())) return Number(value.trim());
  return NaN;
};

// Positive 32-bit integer id, or null.
const parseId = (value) => {
  const n = toInt(value);
  return Number.isInteger(n) && n > 0 && n <= MAX_INT ? n : null;
};

const normalizeEmail = (value) => String(value).trim().toLowerCase();

// Accepts a number of minutes, an interval string ("15 minutes", "00:15:00") or the
// object node-postgres returns for INTERVAL columns ({ minutes: 15 }).
const toInterval = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value === 'number') return `${value} minutes`;
  if (typeof value === 'string') {
    const v = value.trim();
    return /^\d+(\.\d+)?$/.test(v) ? `${v} minutes` : v;
  }
  const parts = INTERVAL_UNITS.filter((unit) => !isAbsent(value[unit])).map(
    (unit) => `${Number(value[unit])} ${unit}`
  );
  return parts.length > 0 ? parts.join(' ') : '0 minutes';
};

const range = (rule) => {
  if (rule.min !== undefined && rule.max !== undefined) return ` entre ${rule.min} i ${rule.max}`;
  if (rule.min !== undefined) return ` més gran o igual que ${rule.min}`;
  if (rule.max !== undefined) return ` més petit o igual que ${rule.max}`;
  return '';
};

const checkers = {
  string: (v, r) => typeof v === 'string' && v.trim().length > 0 && v.length <= (r.max || 255),
  text: (v, r) => typeof v === 'string' && v.length <= (r.max || 5000),
  email: (v) => typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v.trim()),
  password: (v) => typeof v === 'string' && v.length >= 8 && Buffer.byteLength(v, 'utf8') <= 72,
  int: (v, r) => {
    const n = toInt(v);
    return Number.isInteger(n) && n >= (r.min ?? -MAX_INT) && n <= (r.max ?? MAX_INT);
  },
  id: (v) => parseId(v) !== null,
  ids: (v, r) => Array.isArray(v) && v.length <= (r.max || 100) && v.every((x) => parseId(x) !== null),
  // http(s) URL or a relative path such as "default.png"; no javascript:, data:, etc.
  url: (v) =>
    typeof v === 'string' &&
    v.length <= 2048 &&
    !/[\s<>"']/.test(v) &&
    (!/^[a-z][a-z0-9+.-]*:/i.test(v) || /^https?:\/\//i.test(v)),
  date: (v) => typeof v === 'string' && DATE_RE.test(v) && !Number.isNaN(Date.parse(v)),
  interval: (v) => {
    if (typeof v === 'number') return Number.isFinite(v) && v >= 0 && v <= 100000;
    if (typeof v === 'string') return INTERVAL_TEXT_RE.test(v.trim());
    if (typeof v === 'object' && !Array.isArray(v)) {
      return Object.entries(v).every(
        ([unit, amount]) => INTERVAL_UNITS.includes(unit) && (isAbsent(amount) || Number.isFinite(Number(amount)))
      );
    }
    return false;
  },
};

const messages = {
  string: (f, r) => `El camp '${f}' ha de ser un text d'1 a ${r.max || 255} caràcters.`,
  text: (f, r) => `El camp '${f}' ha de ser un text de com a màxim ${r.max || 5000} caràcters.`,
  email: (f) => `El camp '${f}' ha de ser un correu electrònic vàlid.`,
  password: (f) => `El camp '${f}' ha de tenir entre 8 i 72 caràcters.`,
  int: (f, r) => `El camp '${f}' ha de ser un nombre enter${range(r)}.`,
  id: (f) => `El camp '${f}' ha de ser un identificador vàlid.`,
  ids: (f, r) => `El camp '${f}' ha de ser una llista d'identificadors (màxim ${r.max || 100}).`,
  url: (f) => `El camp '${f}' ha de ser una URL http(s) o una ruta relativa.`,
  date: (f) => `El camp '${f}' ha de ser una data vàlida (AAAA-MM-DD).`,
  interval: (f) => `El camp '${f}' ha de ser una durada vàlida.`,
};

/**
 * Returns the first validation error message, or null.
 * Rule: { type, required?, nullable?, min?, max? }.
 * Absent values (undefined, null, '') are only an error when `required`, or when the
 * field is present but `nullable: false` (used for NOT NULL columns in updates).
 */
const validate = (data, rules) => {
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    if (isAbsent(value)) {
      if (rule.required || (value !== undefined && rule.nullable === false)) {
        return `El camp '${field}' és obligatori.`;
      }
      continue;
    }
    if (!checkers[rule.type](value, rule)) return messages[rule.type](field, rule);
  }
  return null;
};

// Express middleware: validates req.body against `rules` and answers 400 on failure.
const validateBody = (rules) => (req, res, next) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : null;
  if (!body) return res.status(400).json({ error: 'Cal enviar un cos JSON.' });
  const error = validate(body, rules);
  if (error) return res.status(400).json({ error });
  return next();
};

// For router.param(): rejects ids that are not positive integers.
const validateIdParam = (req, res, next, value) => {
  if (parseId(value) === null) return res.status(400).json({ error: 'Identificador invàlid.' });
  return next();
};

// Copies the whitelisted keys that are present in `source`, turning '' into null.
const pickDefined = (source, keys) => {
  const result = {};
  for (const key of keys) {
    if (source[key] !== undefined) result[key] = source[key] === '' ? null : source[key];
  }
  return result;
};

module.exports = {
  isAbsent,
  toInt,
  parseId,
  normalizeEmail,
  toInterval,
  validate,
  validateBody,
  validateIdParam,
  pickDefined,
};
