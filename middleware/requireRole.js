// Allows the request only if the authenticated user has one of the given roles.
// Must run after authMiddleware.
module.exports =
  (...roles) =>
  (req, res, next) => {
    if (req.user && roles.includes(req.user.tipo)) return next();
    return res.status(403).json({ error: 'No tens permís per a aquesta acció.' });
  };
