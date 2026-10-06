// Minimal in-memory, fixed-window rate limiter (per client IP).
// Good enough for a single instance; use a shared store if the API is scaled out.
// Behind a reverse proxy set TRUST_PROXY so req.ip is the real client address.

const createRateLimiter = ({ windowMs, max, message }) => {
  const hits = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  cleanup.unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: message });
    }
    return next();
  };
};

// Shared by login, registration and password-change endpoints.
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Massa intents. Torna-ho a provar d\'aquí a uns minuts.',
});

module.exports = { createRateLimiter, authRateLimit };
